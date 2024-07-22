<p align="center">
  <a href="#" target="blank"><img src="./docs/FinTrack.png" width="200" alt="FinTrack Logo" /></a>
</p>

  <p align="center">Track your finances, achieve your goals</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# FinTrack API

## Description

FinTrack API is a robust and intuitive expense tracker API designed to empower users to take control of their personal finances. With FinTrack, users can effortlessly track their expenses and incomes, categorize transactions, and generate insightful reports. The API aims to provide a comprehensive solution for personal finance management, making it easy for users to monitor their spending habits, set budgets, and achieve their financial goals.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```

## Design Pattern

### Repository Design Pattern

The Repository Design Pattern encapsulates data access and manipulation logic, making it easier to manage and test. This pattern acts as an intermediary between the domain and data mapping layer, ensuring that data access logic is centralized and reusable.

#### Reason

By separating data access logic, it becomes easier to modify it if there are changes in the database design.

### Singleton Design Pattern

The Singleton Design Pattern aims to ensure that a class has only one instance, providing global access to that instance. This is particularly useful for managing shared resources or controlling access to certain services.

#### Reason

- Centralized Access Control: Ensures there is only one instance of a particular class, making resource or service management more effective.
- Efficient Memory Usage: Reduces memory usage by ensuring that only one instance is created.

## Swagger Documentation

Visit `/docs` and You'll find a swagger API documentation that contains all you need to interact with the API.

## Credits

- Author - [Ahsan Azizan](https://ahsanzizan.xyz)
- Website - Not deployed yet
- Nest.js Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)

## License

This project is [MIT licensed](LICENSE).
