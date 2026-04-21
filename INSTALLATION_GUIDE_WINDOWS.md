# BookIt v12.1.0 - Installation Guide (Windows)

## Overview
BookIt is a desktop invoice and accounting management system for Windows. This guide explains how to install and use it on your PC.

## System Requirements
- **OS:** Windows 7 or later (Windows 10/11 recommended)
- **Architecture:** x64 (64-bit)
- **RAM:** Minimum 2GB (4GB+ recommended)
- **Disk Space:** ~500MB for installation

## Installation Options

### Option 1: Direct Executable (Recommended for Most Users)
The simplest way to use BookIt - no installation required!

**Steps:**
1. Download `BookIt-12.1.0.exe` from the distribution folder
2. Double-click `BookIt-12.1.0.exe` to launch the application
3. The app will start immediately
4. On first run, it will create a database in your user AppData folder

**Important:**
- This is a portable executable - you can copy it to any location
- No installation wizard or registry changes needed
- The app creates its database in: `C:\Users\{YourUsername}\AppData\Local\bookit\`
- You can create a Windows shortcut to `BookIt-12.1.0.exe` for quick access

### Option 2: Unpacked Installation (Advanced)
If you prefer the full app structure:

**Steps:**
1. Download and extract `BookIt-12.1.0-Windows.zip` 
2. Extract to a folder (e.g., `C:\Program Files\BookIt\` or `C:\Users\{YourUsername}\AppData\Local\Programs\BookIt\`)
3. Run `BookIt.exe` from the extracted folder
4. Create a Windows shortcut for easy access

## First Launch

1. **Run the executable** - Double-click `BookIt-12.1.0.exe` or navigate to the folder and run `BookIt.exe`
2. **Wait for app to start** - First launch may take a few seconds as it initializes the database
3. **Enable notifications (Optional)** - Windows may ask for permission to show notifications - grant it for better experience
4. **Start using** - Dashboard will appear, ready to use

## Features

- **Invoice Management** - Create and manage invoices
- **Customer/Supplier Management** - Maintain client and vendor databases
- **Purchase Orders & Quotations** - Generate purchase orders and quotations
- **Accounting Vouchers** - Journal, contra, expense, and loan vouchers
- **Payment Tracking** - Record payments and receipts
- **Reports** - Generate financial statements and charts of accounts
- **Dashboard** - Overview of your business metrics

## Database Location

BookIt uses SQLite for data storage. Your database is stored at:
```
C:\Users\{YourUsername}\AppData\Local\bookit\invoiceflow.db
```

### Backup Your Data
Regular backups are recommended:
1. Navigate to the folder above using Windows File Explorer
2. Copy `invoiceflow.db` to a safe location (USB drive, cloud storage, etc.)

### Restore from Backup
1. Close BookIt completely
2. Replace the current `invoiceflow.db` with your backup
3. Relaunch BookIt

## Troubleshooting

### App Won't Start
- **Antivirus Blocking:** Your antivirus may block the app on first run. Check your antivirus settings and whitelist `BookIt-12.1.0.exe`
- **Missing Dependencies:** Ensure you're running Windows 7 or later
- **Try another location:** Copy `BookIt-12.1.0.exe` to `C:\Users\{YourUsername}\Desktop\` and try again

### Database Errors
- Try deleting the database file and restarting (it will create a fresh one):
  ```
  C:\Users\{YourUsername}\AppData\Local\bookit\invoiceflow.db
  ```
- If problems persist, restore from backup

### Performance Issues
- Close other applications to free up system memory
- Restart Windows
- Ensure at least 500MB free disk space

## Creating a Shortcut on Desktop

1. Right-click `BookIt-12.1.0.exe`
2. Select **Send to** → **Desktop (create shortcut)**
3. The shortcut will appear on your desktop for quick access

## Uninstalling

BookIt doesn't use traditional Windows installer/registry, so removal is simple:

1. Delete the `BookIt-12.1.0.exe` file or the extracted folder
2. (Optional) Delete the database folder to completely remove all data:
   ```
   C:\Users\{YourUsername}\AppData\Local\bookit\
   ```

## File Descriptions

| File | Purpose |
|------|---------|
| `BookIt.exe` / `BookIt-12.1.0.exe` | Main application executable - run this to start BookIt |
| `resources/app.asar` | Bundled application code and assets |
| `*.dll` / `*.pak` | Chromium and Electron framework dependencies |
| `*.dat` / `*.bin` | Runtime resources (internationalization, snapshots) |

##Support & Issues

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Windows is up to date (Windows Update)
3. Ensure you have write permissions to the AppData folder
4. Check anti-virus/firewall settings aren't blocking the app

## Version Information

- **Version:** 12.1.0
- **Built with:** Electron 28, React 18, SQLite3
- **Architecture:** 64-bit Windows
- **Package Date:** April 21, 2026

---

**Ready to use?** Start BookIt now by running `BookIt-12.1.0.exe`!
