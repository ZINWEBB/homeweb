# Google Sheets Setup for Booking System

## Step 1: Create a Google Sheet
1. Go to https://sheets.google.com
2. Create a new blank spreadsheet
3. Name it "MADEHOME Bookings"
4. Create the following headers in row 1:
   - Timestamp
   - Customer Name
   - Customer Email
   - Property ID
   - Property Venue
   - Property Type
   - Bedrooms
   - Bathrooms
   - Compound Space
   - Location
   - Basic Fee
   - Agent Fee
   - Inspection Fee
   - Total Fee
   - Description

## Step 2: Create Google Apps Script
1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete the default code and paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Get the data from the POST request
    const data = JSON.parse(e.postData.contents);

    // Prepare the row data in the same order as your headers
    const rowData = [
      data.timestamp,
      data.customerName,
      data.customerEmail,
      data.propertyId,
      data.propertyVenue,
      data.propertyType,
      data.bedrooms,
      data.bathrooms,
      data.compoundSpace,
      data.location,
      data.basicFee,
      data.agentFee,
      data.inspectionFee,
      data.totalFee,
      data.description
    ];

    // Append the data to the sheet
    sheet.appendRow(rowData);

    // Return success response
    return ContentService
      .createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
```

3. Save the script with name "BookingHandler"

## Step 3: Deploy as Web App
1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Description: "MADEHOME Booking Handler"
4. Execute as: **Me**
5. Who has access: **Anyone** (important for public access)
6. Click **Deploy**
7. **Copy the web app URL** - it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

## Step 4: Update detailpage.js
1. Open `detailpage.js`
2. Find this line: `const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';`
3. Replace `YOUR_SCRIPT_ID` with the actual ID from your web app URL

**Example:** If your URL is `https://script.google.com/macros/s/ABC123def456/exec`, then use:
```javascript
const scriptURL = 'https://script.google.com/macros/s/ABC123def456/exec';
```

## Step 5: Enable Google Sheets API (if needed)
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create credentials (API Key) if needed

## Testing
1. Go to detail page
2. Click on a property to see details
3. Enter name and email
4. Click "Book Now"
5. Check your Google Sheet for the new row

## Security Notes
- The web app is set to "Anyone" access, which allows public submissions
- Consider adding authentication if you need more security
- Monitor your Google Sheet regularly for new bookings

## Free Limits
- Google Sheets: Unlimited rows
- Google Apps Script: 6 hours of runtime per day (more than enough for bookings)