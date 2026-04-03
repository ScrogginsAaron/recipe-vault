# RecipeVault



RecipeVault is a backend-first full-stack application designed to store, search, and digitize cooking recipes.



The platform is being built to support:

\- manual recipe entry

\- weekly meal planning

\- intelligent ingredient aggregation



Future goals include PDF ingestion, OCR-based parsing of handwritten recipes, and exportable meal plan PDFs.



## Motivation



Many recipes exist only as handwritten notes or scanned documents, making them difficult to organize
and search. RecipeVault aims to preserve these recipes in a structured, searchable format while also
providing practical tools such as meal planning and document export.



## Tech Stack



* (Planned) Frontend: React, TypeScript
* Backend: Node.js, Express, TypeScript
* Database: PostgreSQL, Prisma
* Authentication: JWT
* Document Processing: PDF parsing, OCR
* PDF Generation: (Planned) frontend export with optional server-side support



## Core Features

* Weekly meal planning with manual or randomized recipe selection
* Intelligent ingredient aggregation for grocery planning
* Recipe listing and detail views
* Search by recipe name or ingredient
* User authentication and recipe ownership


## Planned Features

* PDF recipe ingestion
* OCR support for handwritten recipes
* Export weekly meal plans as downloadable PDFs
* Frontend application built with React and TypeScript


## 🌱 Seeding the Database

To populate sample data:

npx prisma db seed


## Ingredient Aggregation System (Highlight)


One of the core challenges in RecipeVault is combining ingredient quantities across multiple recipes in a realistic way.
This system was designed to simulate real-world messy data rather than ideal structured input.


The system supports:

\- fractions (`1/2`, `1 1/2`)

\- decimals (`1.5`)

\- ranges (`1-2 cloves`)

\- unit normalization (`cups` → `cup`, `tbsp` → `tablespoon`)

\- descriptor handling (`2 large eggs`)

\- package parsing (`1 (14 oz) can tomatoes`)



Instead of failing on inconsistent data, the system:

\- aggregates compatible quantities

\- preserves unparseable values like `to taste`

\- extracts useful metadata (size, descriptors)



This reflects real-world data challenges where inputs are inconsistent and require flexible parsing.



## Weekly Meal Planning

Users can generate a weekly meal plan in one of two ways:

* **Manual selection** of recipes for each day
* **Randomized selection** from all recipes or user-favorited recipes

Generated meal plans include:

* daily recipe assignments
* aggregated ingredient summaries for grocery planning



PDF export is planned as a future feature.



## Architecture Overview

RecipeVault follows a modular full-stack architecture:
(Planned) Frontend (React + TypeScript)
|
| REST API
v
Backend (Node.js + Express)
|
| Prisma ORM
v
PostgreSQL Database



## Backend Architecture



The backend follows a layered Express architecture:



* **Routes** - Define API endpoints and apply middleware
* **Middleware** - Reusable validation and error handling
* **Controllers** - Business logic and database interaction
* **Validators** - Zod schemas for request validation
* **Config** - Infrastructure setup (Prisma client)



Validation is handled using **Zod**, ensuring runtime safety and structured error responses.



Errors are processed through a centralized error handler to maintain consistent API responses.



## API Design Principles



* Schema-based validation using Zod
* Centralized error handling middleware
* RESTful route structure
* Consistent JSON error responses
* Separation of configuration, routing, and business logic



## Project Structure



src/

   app.ts

   server.ts

   routes/

   controllers/

   validators/

   middleware/

   config/



### Document \& PDF Processing Flow



User Upload
↓
Upload Service
↓
PDF / OCR Parsing
↓
Structured Recipe Draft
↓
User Review \& Save



### Meal Plan PDF Generation Flow



Meal Plan Request
↓
Meal Plan Service (selection logic)
↓
PDF Generation Service
↓
PDF Response to Client



### Example: Create Recipe



POST /recipes



Request:

{

  "name": "Spaghetti Bolognese"

}



Response:



201 Created



{

  "id": "uuid",

  "name": "Spaghetti Bolognese",

  "createdAt": "timestamp"

}



### Example: Create Recipe Error Response



400 Bad Request



{

  "error": "Invalid request body",

  "fields": {

    "name": {

      "message": "Recipe name is required"

    }

  }

}

## 🧪 API Testing (Postman)

A Postman collection is included in `/postman` for testing all endpoints.

To use:
1. Import the collection into Postman
2. Set your base URL (e.g., `http://localhost:3000`)

## Status



✅ Backend complete and ready for use

🔜 Frontend coming next



## Goals



* Demonstrate full-stack application design
* Work with structured and unstructured data
* Apply OCR and document-processing techniques in a production-style workflow
* Build a practical, user-focused feature set



## What I’m Learning



\- Designing modular backend architecture with Express

\- Handling structured and unstructured data

\- Building resilient parsing systems for inconsistent inputs

\- Using Prisma for type-safe database access

\- Designing APIs before building a frontend

