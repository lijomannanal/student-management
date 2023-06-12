# Student-Management
## Application deployment
- The application is deployed to AWS EC2 instance and can be accessed via http://ec2-54-169-209-222.ap-southeast-1.compute.amazonaws.com:8080/api-docs/#/

## Prerequisites for running local instance
- Install NodeJS v16.x.x
- Install MySQL v8.0.x
- Create databases in mysql server
  - student-management-db (For storing application data)
  - student-management-db-test (For running the api tests)
- Update mysql password (DB_PW) in environment files at the project root:
  - ./.env.production
  - ./.env.test

<br>

## Ports used
| S/N | Application | Exposed Port 
|-----|-------------|--------------
| 1 | database | 3306 |    
| 2| server | 8080 |   
| 3| test server | 8082 |   

You are free to use different ports for running the application locally. To customize the application ports, update PORT entry in .env.production.env.test file

<br>

## Commands for running local instance
All the commands listed should be ran in ./student-management directory.

### Installing dependencies
```bash
npm install
```

<br>

### Starting Project
Starting the application in local environment
```bash
npm start
```
<br>


### Check local instance running status
To check the application status, you can check the logs generated in the console. If it shows the following message, you can access the api documentation via http://localhost:8080/api-docs 
```
[server.js]     INFO    Application started at http://localhost:8080
```


If you encounter the following error when running ```npm start```, please make sure that you have installed mysql and configured the credentials correctly in .env.production and .env.test files.

```
[server.js]	ERROR   SequelizeAccessDeniedError: Access denied for user 'root'@'localhost' (using password: YES).
[server.js]	ERROR	Unable to start application
```

<br>

### Running unit tests
This will execute the unit test cases and integration tests.
```bash
npm test
```

### Notes
- APIs are documented using Swagger. So all the api endpoints can be tested in local instance using the Swagger UI (http://localhost:8080/api-docs)
- DB Logs are disabled in the production build. But it can be enabled by updating the ENABLE_DB_LOGS=1 in .env.production file at the project root

<br>

