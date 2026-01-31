# Deployment Guide: Allies Connect on AWS Lightsail (Amazon Linux 2)

> [!WARNING]
> **Amazon Linux 2 Compatibility Issue**: You previously encountered an error installing Node.js 20. This is because Amazon Linux 2 uses an older version of `glibc` that is incompatible with modern Node.js 18+ binaries.
>
> **Solution**: We will **build the application locally** on your computer and deploy the compiled files. This avoids needing to install Node.js on the server at all.

## Prerequisites

1.  **AWS Lightsail Instance**: Running Amazon Linux 2.
2.  **Web-Based SSH**: For running commands on the server.
3.  **Local Dev Environment**: You already have the code and Node.js working on your computer.

---

## Step 1: Prepare the Server (No Node.js needed)

Connect to your instance via Web-based SSH and install minimal tools.

### 1.1 Update and Install Git
```bash
sudo yum update -y
sudo yum install git unzip -y
```

---

## Step 2: Set Up PocketBase

We will download the PocketBase binary. PocketBase is written in Go and runs on Amazon Linux 2 without extra dependencies.

### 2.1 Download PocketBase
```bash
# Create a directory for the application
mkdir -p ~/allies-connect
cd ~/allies-connect

# Download PocketBase (Linux AMD64)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.25/pocketbase_0.22.25_linux_amd64.zip

# Unzip and remove the archive
unzip pocketbase_0.22.25_linux_amd64.zip
rm pocketbase_0.22.25_linux_amd64.zip
```
*(Check [pocketbase.io](https://pocketbase.io/docs/) for new versions if needed).*

### 2.2 Make Executable
```bash
chmod +x pocketbase
```

### 2.3 Set Up Environment Variables
Create a `.env` file for sensitive credentials (required for admin scripts).
```bash
nano .env
```
Paste your variables:
```ini
ADMIN_EMAIL=your_email@example.com
ADMIN_PASS=your_secure_password
```
*(Save: Ctrl+O, Enter, Ctrl+X)*

---

## Step 3: Build Locally and Deploy

Since we cannot build on the server, we will build on your machine and commit the `dist` folder to Git.

### 3.1 Build on Local Machine
In your local VS Code terminal (ensure you are in the `client` directory, or `cd client`):
```bash
npm run build
```
This updates the `client/dist` folder.

### 3.2 Commit the Build
By default, `dist` is ignored. We will force-add it or create a deployment branch.
```bash
# From project root locally
git checkout -b deployment
# Edit .gitignore to remove 'dist' OR just force add it:
git add client/dist -f
git commit -m "Deploy: Add compiled frontend"
git push origin deployment
```
*(If you used a new branch, push that branch).*

### 3.3 Pull on Server
Back in your **Lightsail Web SSH**:
```bash
# Clone the repo (or pull if already there)
cd ~/allies-connect
git clone <YOUR_GIT_REPO_URL> source_code --branch deployment
# If asking for auth, you might need to use an HTTPS token or make the repo public temporarily.
```

### 3.4 Move Files to PocketBase
```bash
cd ~/allies-connect
# Remove old public dir
rm -rf pb_public
# Move the compiled dist folder to be pb_public
cp -r source_code/client/dist pb_public
```

---

## Step 4: Setup Systemd Service

Run PocketBase in the background.

### 4.1 Create Service File
```bash
sudo nano /etc/systemd/system/pocketbase.service
```

### 4.2 Make Binary Capable of Port 80
By default, the `ec2-user` cannot use port 80. Run this command to allow it:
```bash
sudo setcap cap_net_bind_service=+ep /home/ec2-user/allies-connect/pocketbase
```

### 4.3 Paste Configuration
Paste the following content.
**IMPORTANT:** Copy the `ExecStart` line exactly. Do NOT add quotes around the IP address or flags.

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/allies-connect
ExecStart=/home/ec2-user/allies-connect/pocketbase serve --http=0.0.0.0:80
Restart=always

[Install]
WantedBy=multi-user.target
```
*Note: Using port 80 requires this service to run effectively as root or have capabilities, but systemd handles it. If it fails, try port 8090 and update firewall.*

### 4.4 Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```
Check status: `sudo systemctl status pocketbase`

---

## Step 5: Configure Firewall

1.  In Lightsail Console > **Networking**.
2.  Ensure **HTTP (Port 80)** is open.

## Step 6: Verification

Visit `http://<YOUR_STATIC_IP>/`. You should see the app.
Visit `http://<YOUR_STATIC_IP>/_/` for the backend.

## Troubleshooting

### "Site Can't Be Reached"
1. **Check Networking / Firewall**:
   - Go to the **Lightsail Console** > Select Instance > **Networking**.
   - Ensure there is a Firewall rule allowing **HTTP (TCP 80)** from **Any IP address**.
2. **Architecture Clarification**:
   - You do **NOT** need to start a Node/React server (like `npm start`).
   - PocketBase acts as the web server. It serves the static files you copied into the `pb_public` folder.
3. **Verify Deployment**:
   - Run: `ls -l ~/allies-connect/pb_public/`
   - You should see `index.html` and an `assets` folder.
   - If `pb_public` is empty, go back to Step 3.4.

---

## Updates & Maintenance

### Deploying New Changes
To update your deployed application (frontend changes or code updates):

1.  **Local Machine**: Build and Push
    ```bash
    # In 'client' directory
    npm run build
    
    # In project root
    git add client/dist -f
    git commit -m "Deploy: Update frontend and code"
    git push origin deployment
    ```

2.  **Server**: Pull and Refresh
    ```bash
    cd ~/allies-connect/source_code
    
    # 1. Get latest code
    git pull origin deployment
    
    # 2. Update frontend assets (if changed)
    rm -rf ../pb_public/*
    cp -r client/dist/* ../pb_public/
    ```

### Transitioning to Secure Credentials (One-Time)
If you are analyzing an existing deployment where credentials were previously hardcoded:

1.  **Pull the latest code**: Running the `git pull` command above will replace the old `setup_schema.mjs` file (which had credentials) with the new secure version.
2.  **Create .env file**:
    You must create the environment variable file on the server for admin scripts to work.
    ```bash
    cd ~/allies-connect/source_code/client
    nano .env
    ```
    Add your variables:
    ```ini
    ADMIN_EMAIL=pocketbase@dvmccollum.com
    ADMIN_PASS=your_secure_password
    ```
    *(Save: Ctrl+O, Enter, Ctrl+X)*
