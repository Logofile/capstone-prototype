**CAPSTONE PROJECT SPECIFICATION**

**Georgia’s Community Resource- Allies Connect**

**Phase I: Manual-First MVP \+ Automation Feasibility Research \+ Optional Limited Automation**

---

**Sponsor Information**

**Sponsor:** Allies Way, Inc.  
**Primary Contact:** Dr. Nytoyia Laughlin, Founder & Executive Director  
**Email:** nlaughlin@alliesway.org  
**Sponsor Availability:** Bi-weekly feedback, flexible check-ins  
**Team Size:** 3–5 undergraduate computing students  
**Project Duration:** One semester (Phase I MVP)

---

**Project Overview**

Allies Connect is a mobile-friendly web platform designed to help Georgia residents quickly find essential community resources—food distribution sites, shelters, community fridges, emergency pop-ups, nonprofit events, and volunteer opportunities—through a unified, statewide interface. Our goal is to have as many resources as possible reflected on our platform- and to achieve this, we must make it easy for service providers to have information added to it\!

The platform supports three core personas:

1. **Public User** – Residents looking for resources or events

2. **Service Provider** – Nonprofits, churches, community groups posting resources and opportunities

3. **Admin** – Superusers managing listings and system integrity

Phase I establishes a **manual-first functional MVP** with:

* Resource directory

* Events calendar

* Volunteer management tools

* Provider portal

* Optional limited automation (Google Calendar ingestion \+ availability calls)

* Research on future automation


This project offers students meaningful real-world experience in backend design, UX for underserved communities, community-scale systems, and phased automation planning.

---

**Problem Background & Motivation**

Georgia residents rely heavily on nonprofits for food, shelter, crisis assistance, and community support—but information is scattered, outdated, or manually maintained across:

* Websites

* Social media

* PDFs

* Phone trees

* Flyers

Nonprofits themselves struggle to:

* Keep information updated

* Manage volunteers

* Publish events consistently

* Reach underserved communities

Allies Way seeks to unify this ecosystem by creating a **single mobile-friendly entry point** for residents while supporting nonprofits with modern tools that reduce administrative load.

Phase I builds the operational foundation; later phases will incorporate deeper automation to transform how community data is collected, validated, and distributed.

---

**Phase 1 Goal (One-Semester MVP Scope)**

Deliver a **manual-first**, fully functional web platform with:

* Resource listings

* Events calendar

* Volunteer management

* Provider accounts

* Admin moderation

* Logging

* Stretch optional automation

* Research report outlining future automated ingestion \+ advanced features

This constitutes a fully usable MVP for the community, while laying groundwork for Phase II intelligent automation.

---

**Core MVP Features (Phase 1\)**

**1\. Public Resource Finder**

* Mobile-friendly map

* Manual zip code entry or geolocation

* Filters by category, county, date

* List view \+ map view

* Resource detail pages

**2\. Events Directory**

* Manual creation of events

* Basic organization-submitted event form

* Calendar and list views

* Filters by date, zip code, and category

**3\. Volunteer Management System (Major Required Feature)**

* Volunteer opportunity creation

* Form builder (fields: name, phone, email, shift selections, etc.)

* Slot/shift selection

* “Volunteers needed” tags

* Volunteer dashboard for nonprofits

* Export to CSV

* Automated email reminders (simple version)

**4\. Organization Portal**

* Registration \+ login

* Organization profile

* Manage resources

* Manage events

* Manage volunteer postings

* Optional opt-in settings for automation (see below)

**5\. Admin Console**

* Approve/reject new providers

* Remove outdated or inappropriate listings

* Basic logging: who updated what, when

**6\. Backend Architecture**

* REST API for all CRUD operations

* Database schema for users, organizations, resources, events, volunteers, logs

* Simple permissions model

* Logging for updates \+ admin actions

**7\. Research Component (Required)**

Students must investigate:

* How nonprofits currently publish resource updates, events, and volunteer needs

* Feasibility of general automation

* Methods used by existing platforms (e.g., Meetup, Eventbrite, Benevity, HandsOn)

* Recommended candidate formats for future automated ingestion

* Risks, technical barriers, and potential pilot partners

Students must produce a **Future Automation Roadmap**.

**8\. OPTIONAL Stretch Automation (Option A)**

Only if sponsor approves and only if time permits:

**A. Event Automation (Google Calendar ICS Ingestion)**

* Provider adds link to public Google Calendar

* System automatically retrieves events

* Parse and store structured event data

* Updated periodically

**B. Automated Resource Availability Calls**

* Providers opt in

* Configure phone number, interval, time window

* System detects stale availability

* Outbound call with simple numeric response (“Press 1 \= Open, Press 2 \= Closed”)

* Update database upon response

**C. Student-Proposed Automation Features**

Students are encouraged to propose **one innovative automation**, such as:

* Auto-summarizing events using AI

* AI categorization of resources

* Suggesting volunteer opportunities based on user behavior

* Detecting stale listings with simple heuristics

Sponsor must approve before implementation.

---

**Stakeholder Constraints & Preferences**

* Platform must be **mobile-friendly web**, not native mobile.

* Backend must be hosted on **KSU-provided infrastructure** or other **no-cost** environments.

* Accessibility should be considered (WCAG basics).

* System must be modular enough for Phase II expansion.

* No paid APIs unless provided by sponsor.

* Automated features only implemented if approved by sponsor.

---

**User Personas / Roles**

**Public User**

Seeks food, shelter, events, volunteering opportunities.

**Service Provider**

Nonprofit organization posting resources, events, and volunteer opportunities.

**Admin**

Moderates data and manages system integrity.

---

**Functional Requirements**

(Condensed here; full detail to be captured in Milestone 1 Requirements Document.)

**Public Users**

* Search resources

* View events calendar

* Filter and browse

* View volunteer openings

* Register for volunteer shifts

**Providers**

* Register/login

* Create/update resources

* Create/update events

* Publish volunteer opportunities

* Export volunteer signups

**Admins**

* Approve/reject providers

* Manage listings

* Moderate content

* View logs

**Research Requirements**

* Produce feasibility analysis

* Identify top tools used by nonprofits

* Recommend formats for Phase II automation

**Optional Automation Requirements (If implemented)**

* ICS ingestion

* Automated calls

* Innovation feature

---

**Non-Functional Requirements**

* Mobile-first responsive UI

* Clear, accessible UX

* Secure authentication

* Data validation

* Logging and auditability

* Modular backend design

* Documentation for future teams

---

**Milestones & Deliverables**

**Milestone 1 — Requirements & Foundation**

* Full requirements document

* Personas, use cases, user stories

* Architecture diagrams

* ERD and data models

* User flow diagrams

* UX wireframes (public, provider, admin)

* Automation feasibility research plan

* GitHub repository created and shared

---

**Milestone 2 — Prototype & Core Features**

* Backend API and database

* Provider login \+ dashboard

* Manual resource, event, volunteer creation

* Public resource finder \+ events calendar

* Volunteer sign-up system

* Admin approval workflow

* Logging

* Stretch automation (if approved): ICS ingestion \+ call workflow

* Updated documentation

---

**Milestone 3 — Final Integrated Prototype**

* Fully functioning web platform

* Completed stretch automation (if implemented)

* Completed research report \+ future roadmap

* End-to-end system demo

* Test cases \+ QA report

* Final presentation uploaded to GitHub

* Complete GitHub repository with documentation

---

**GitHub & Documentation Requirements**

Must include:

* All code

* Requirements document

* Architecture diagrams

* API documentation

* Setup/installation guide

* Demo data

* Milestone releases

* UI/UX artifacts

* Research report

* Future automation roadmap

---

**Résumé-Style Student Achievements**

Students will be able to write:

* *Delivered a mobile-friendly statewide community platform enabling resource discovery, event management, and volunteer engagement for Georgia nonprofits.*

* *Designed and implemented multi-persona workflows (public, provider, admin) with secure authentication and CRUD operations.*

* *Built volunteer scheduling tools including shift management, email reminders, and roster exports.*

* *Developed automated data ingestion from Google Calendar ICS feeds (optional).*

* *Implemented automated availability-update phone workflows using configurable provider settings (optional).*

* *Conducted a research study on nonprofit automation feasibility and produced a Phase II roadmap.*

* *Created accessible, responsive UI and deployed backend services on university infrastructure.*

---

**GUI Screens & Wireframes (Descriptions)**

**Public User Screens**

* Home map view

* Filter panel

* Resource detail page

* Event calendar

* Volunteer opportunities list

**Provider Screens**

* Registration & login

* Profile dashboard

* Resource creation

* Event creation

* Volunteer opportunity creation

* Volunteer signup export

**Admin Screens**

* Organization approval queue

* Listing moderation

* Logs dashboard

---

**Suggested Tech Stack**

**Frontend:** React (preferred), Vue, or responsive HTML/JS  
**Backend:** Node.js/Express or Python FastAPI  
**Database:** PostgreSQL, Supabase, Firebase, or MySQL  
**Maps:** Google Maps or Mapbox  
**Email:** SendGrid / SMTP / free-tier mail API  
**Hosting:** KSU-provided servers or free-tier cloud  
**Automation (Optional):** ICS ingestion, Twilio (sandbox), or equivalent

