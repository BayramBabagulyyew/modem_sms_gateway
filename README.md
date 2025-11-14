# SMS Sender (Express.js)

Documentation

This project setup involves the following steps:

1. **Create environment files**:  
   Prepare necessary `.env` files containing environment variables required for the application.
   USB MODEM path also set in env

2. **Install dependencies**:  
   Run `npm install` to install all required Node.js packages specified in `package.json`.

3. **Open a root shell**:  
   Run `sudo su` in your terminal to switch to the root user if required by your environment.

4. **Start development server**:  
   Use `node index.js` to launch the application in development mode.

## API Endpoints

### 1. Send SMS

- **Endpoint:** `POST /sms/send`
- **Description:** Sends an SMS message using the connected USB modem.
- **Request Body:**
  ```json
  {
    "to": "+1234567890",
    "message": "Hello, this is a test SMS.",
    "projectName": "E-Center"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Message sent successfully.",
      "logId": "id"
    }
  }
  ```
- **ERROR Response:**
  ```json
  {
    "success": false,
    "message": "Message sent successfully."
  }
  ```

### 2. Health Check

- **Endpoint:** `GET /sms/health`
- **Description:** Checks if the server and modem are operational.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Message sent successfully.",
      "status": "ok"
    }
  }
  ```

## Example: Sending Data

To send an SMS, use a tool like `curl` or Postman:

```bash
curl -X POST http://localhost:3000/send \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: application/json" \
    -d '{"to": "+1234567890", "message": "Hello, this is a test SMS."}'
```

### 4. Get Messages from usb modem and delete getted

- **Endpoint:** GET /sms/messages
- **Description:** Retrieves all messages sent by users.

- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "id",
      "timestamp": "new Date().toISOString()",
      "to": "+99362509001",
      "message": "Hi from Bayram",
      "projectName": "projectName",
      "ip": "1.1.1.1",
      "status": "pending"
    }
  }
  ```
