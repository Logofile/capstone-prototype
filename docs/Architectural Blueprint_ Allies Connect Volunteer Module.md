# **Architectural Blueprint for Allies Connect Volunteer Management System (MVP)**

## **1\. Strategic Context and Domain Analysis**

The **Allies Connect** platform aims to bridge the gap between Georgia residents and service providers through a mobile-friendly interface. This "Volunteer Tracking Component" serves as the engine for the Phase I MVP, enabling nonprofits to publish needs and residents to register for shifts seamlessly.

### **1.1 The "Hybrid Profile" Data Strategy**

The requirements introduce a unique challenge: balancing a centralized **Volunteer Profile** with the need for service providers to create **Custom Forms** for each opportunity.

* **The Conflict:** A purely static profile (standard Name/Email) is efficient but rigid. The requirements state providers must "define required fields" specific to their posting.  
* **The Solution:** This schema adopts a **Hybrid EAV (Entity-Attribute-Value)** model using JSONB. The system maintains a core Volunteer\_Profile for system-wide identity (Name, Email, Phone) but attaches a custom\_form\_schema to the Opportunity and a form\_response\_data payload to the Signup. This allows a food bank to ask for "Dietary Restrictions" while a shelter asks for "T-Shirt Size," satisfying the "Form Builder" requirement.1

## ---

**2\. Comprehensive Entity Specification**

### **2.1 The Constituent Core: Volunteer\_Profile**

This entity represents the "Public User" in the Allies Connect ecosystem. It stores the immutable identity data required for authentication and basic contact.

| Field Name | Data Type | Rationale and Context |
| :---- | :---- | :---- |
| volunteer\_id | UUID | Primary Key. |
| external\_auth\_id | String(255) | Link to the main Allies Connect authentication (e.g., Auth0/Firebase). |
| first\_name | String(100) | Core identity. |
| last\_name | String(100) | Core identity. |
| email | String(255) | Unique index. Primary communication channel. |
| phone\_primary | String(20) | Critical for the "automated email/SMS reminders" requirement.1 |
| zip\_code | String(10) | Supports "Find opportunities near me" functionality. |
| created\_at | Timestamp | Audit trail. |

### **2.2 The Posting Engine: Opportunities**

This entity represents the "Volunteer Posting" created by the Service Provider. It has been significantly updated to support the **Form Builder** and **Tags** requirements.

| Field Name | Data Type | Rationale and Context |
| :---- | :---- | :---- |
| opportunity\_id | UUID | Primary Key. |
| provider\_org\_id | UUID | Link to the Service Provider Organization (External Scope). |
| title | String(255) | The headline displayed to public users. |
| description | Text | Full details of the work. |
| tags | Text | **New:** Array field to store tags like "Volunteers Needed" or "Urgent".1 |
| form\_builder\_schema | JSONB | **New:** Stores the configuration of the custom form. Example: }\]. |
| is\_published | Boolean | Controls visibility on the public list. |
| point\_of\_contact | JSONB | Stores name/email/phone of the coordinator for this specific post. |

### **2.3 Scheduling: Shifts**

To support "specific shift selections," this entity breaks down an Opportunity into selectable time slots.

| Field Name | Data Type | Rationale and Context |
| :---- | :---- | :---- |
| shift\_id | UUID | Primary Key. |
| opportunity\_id | UUID | Foreign Key. |
| start\_datetime | Timestamp | ISO 8601 format. |
| end\_datetime | Timestamp | ISO 8601 format. |
| capacity | Integer | Max number of volunteers allowed. |
| slots\_filled | Integer | Cached count of confirmed signups. |

### **2.4 Engagement: Shift\_Signups**

This is the transactional record of a user committing to a shift. It now includes the dynamic data from the form builder and status tracking for the automated reminders.

| Field Name | Data Type | Rationale and Context |
| :---- | :---- | :---- |
| signup\_id | UUID | Primary Key. |
| shift\_id | UUID | Foreign Key. |
| volunteer\_id | UUID | Foreign Key. |
| status | Enum | Pending, Confirmed, Cancelled, NoShow. |
| form\_response\_data | JSONB | **New:** Stores the user's answers to the custom questions defined in form\_builder\_schema. |
| reminder\_sent\_at | Timestamp | **New:** Tracks if the "automated email reminder" has been sent.1 |
| signup\_date | Timestamp | Used for FIFO waitlist handling. |

## ---

**3\. Entity-Relationship Diagram (ERD) Narrative**

1. **Service Provider \-\> Opportunities:** One Provider (Organization) manages **Many** Opportunities.  
2. **Opportunity \-\> Shifts:** One Opportunity defines **Many** specific Shifts (Time Slots).  
3. **Opportunity \-\> Form Definition:** The Opportunity entity *contains* the schema for the custom form (stored as JSONB).  
4. **Volunteer \-\> Signups:** One Volunteer can have **Many** Signups across different opportunities.  
5. **Shift \-\> Signups:** One Shift has **Many** Signups (up to Capacity).  
6. **Signup \-\> Form Response:** The Signup entity *contains* the specific answers provided by the volunteer for that event (stored as JSONB).

## ---

**4\. SQL Implementation Specification**

The following SQL is tailored for **PostgreSQL**, utilizing JSONB to fulfill the dynamic form requirement without creating dozens of extra tables.

SQL

/\*  
 \* ALLIES CONNECT \- VOLUNTEER MODULE SCHEMA (MVP)  
 \* Dialect: PostgreSQL  
 \*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\-- \==========================================  
\-- 1\. ENUMS & UTILITIES  
\-- \==========================================  
CREATE TYPE signup\_status\_type AS ENUM ('Pending', 'Confirmed', 'Waitlist', 'Cancelled', 'NoShow');

\-- \==========================================  
\-- 2\. VOLUNTEERS (Public Users)  
\-- \==========================================  
CREATE TABLE volunteer\_profiles (  
    volunteer\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    external\_auth\_id VARCHAR(255) UNIQUE NOT NULL, \-- Link to Auth0/Firebase  
    first\_name VARCHAR(100) NOT NULL,  
    last\_name VARCHAR(100) NOT NULL,  
    email VARCHAR(255) UNIQUE NOT NULL,  
    phone\_primary VARCHAR(20),  
    zip\_code VARCHAR(10),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

\-- \==========================================  
\-- 3\. OPPORTUNITIES (Provider Postings)  
\-- \==========================================  
CREATE TABLE opportunities (  
    opportunity\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    provider\_org\_id UUID NOT NULL, \-- Stub ID for the Service Provider  
      
    title VARCHAR(255) NOT NULL,  
    description TEXT,  
      
    \-- Requirement: "Volunteers needed tags"  
    \-- Stored as array for easy filtering: e.g.,  
    tags TEXT,   
      
    \-- Requirement: "Form builder to define required fields"  
    \-- Stores the definition. Example:  
    \--  
    form\_builder\_schema JSONB DEFAULT '',  
      
    is\_published BOOLEAN DEFAULT TRUE,  
      
    \-- Contact info for this specific post (Provider Dashboard visibility)  
    point\_of\_contact\_name VARCHAR(100),  
    point\_of\_contact\_email VARCHAR(255),  
      
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP  
);

\-- Index for searching tags (e.g., "Find all 'Urgent' needs")  
CREATE INDEX idx\_opportunities\_tags ON opportunities USING GIN (tags);

\-- \==========================================  
\-- 4\. SHIFTS (Specific Slots)  
\-- \==========================================  
CREATE TABLE shifts (  
    shift\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    opportunity\_id UUID NOT NULL REFERENCES opportunities(opportunity\_id) ON DELETE CASCADE,  
      
    start\_datetime TIMESTAMP NOT NULL,  
    end\_datetime TIMESTAMP NOT NULL,  
      
    capacity INTEGER DEFAULT 10,  
      
    \-- Denormalized count for performance  
    slots\_filled INTEGER DEFAULT 0,  
      
    CONSTRAINT chk\_shift\_time CHECK (end\_datetime \> start\_datetime)  
);

CREATE INDEX idx\_shifts\_opp ON shifts(opportunity\_id);  
CREATE INDEX idx\_shifts\_date ON shifts(start\_datetime);

\-- \==========================================  
\-- 5\. SIGNUPS (The Registration)  
\-- \==========================================  
CREATE TABLE shift\_signups (  
    signup\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    shift\_id UUID NOT NULL REFERENCES shifts(shift\_id),  
    volunteer\_id UUID NOT NULL REFERENCES volunteer\_profiles(volunteer\_id),  
      
    status signup\_status\_type DEFAULT 'Confirmed',  
      
    \-- Requirement: Capture data from the custom form  
    \-- Example: {"diet": "Gluten Free", "waiver": true}  
    form\_response\_data JSONB DEFAULT '{}',  
      
    signup\_date TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
      
    \-- Requirement: "Automated email reminders"  
    \-- System updates this timestamp when the reminder job runs  
    reminder\_sent\_at TIMESTAMP,  
      
    \-- Prevent duplicate signups for the same shift  
    UNIQUE (shift\_id, volunteer\_id)  
);

\-- \==========================================  
\-- 6\. VIEWS FOR EXPORT (CSV Requirement)  
\-- \==========================================  
\-- This view simplifies the "Export to CSV" requirement for the Provider Dashboard.  
\-- It flattens the basic volunteer info with the shift details.

CREATE OR REPLACE VIEW view\_roster\_export AS  
SELECT   
    s.shift\_id,  
    o.title AS opportunity\_title,  
    sh.start\_datetime,  
    v.first\_name,  
    v.last\_name,  
    v.email,  
    v.phone\_primary,  
    s.status,  
    s.form\_response\_data \-- Export tools can parse this JSON column  
FROM shift\_signups s  
JOIN shifts sh ON s.shift\_id \= sh.shift\_id  
JOIN opportunities o ON sh.opportunity\_id \= o.opportunity\_id  
JOIN volunteer\_profiles v ON s.volunteer\_id \= v.volunteer\_id;

## **5\. Technical Implementation Notes**

1. **Handling the Form Builder:**  
   * **Frontend (Provider Portal):** The UI should allow providers to add fields. This generates a JSON object saved to opportunities.form\_builder\_schema.  
   * **Frontend (Public User):** When a user clicks "Sign Up," the app renders the form inputs based on that JSON schema.  
   * **Backend:** When the form is submitted, the key-value pairs are validated and saved into shift\_signups.form\_response\_data.  
2. **Exporting to CSV:**  
   * The view\_roster\_export view provided in the SQL schema abstracts the complexity of joins. The backend simply needs to run SELECT \* FROM view\_roster\_export WHERE shift\_id \=? and stream the results to a CSV generator.  
3. **Automated Reminders:**  
   * A nightly cron job should query: SELECT \* FROM shift\_signups WHERE reminder\_sent\_at IS NULL AND shift\_id IN (SELECT shift\_id FROM shifts WHERE start\_datetime BETWEEN NOW() AND NOW() \+ INTERVAL '24 HOURS').  
   * After sending the email, update reminder\_sent\_at \= NOW().

#### **Works cited**

1. Volunteers for Salesforce App: A Deep Dive, accessed January 24, 2026, [https://www.salesforceben.com/volunteers-for-salesforce-app-a-deep-dive/](https://www.salesforceben.com/volunteers-for-salesforce-app-a-deep-dive/)