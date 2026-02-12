# RecipeVault



RecipeVault is a full-stack web application designed to store, search, and digitize cooking recipes.
The platform supports manual recipe entry, PDF ingestion, OCR-based parsing of handwritten recipes,
and weekly meal planning with exportable PDF summaries.



## Motivation



Many recipes exist only as handwritten notes or scanned documents, making them difficult to organize
and search. RecipeVault aims to preserve these recipes in a structured, searchable format while also
providing practical tools such as meal planning and document export.



## Tech Stack



* Frontend: React, TypeScript
* Backend: Node.js, Express, TypeScript
* Database: PostgreSQL, Prisma
* Authentication: JWT
* Document Processing: PDF parsing, OCR
* PDF Generation: Server-side PDF creation



## Core Features

* Recipe listing and detail views
* Search by recipe name or ingredient
* User authentication and recipe ownership
* Upload and parse PDF recipes
* OCR support for handwritten recipes
* Weekly meal planning with manual or randomized recipe selection
* Export weekly meal plans as downloadable PDFs



## Weekly Meal Planning

Users can generate a weekly meal plan in one of two ways:

* **Manual selection** of recipes for each day
* **Randomized selection** from all recipes or user-favorited recipes

Generated meal plans can be exported as a PDF containing:

* Week range
* Daily recipe assignments
* Ingredient lists for each recipe

PDFs are generated server-side to ensure consistent formatting and reliable downloads.



## Architecture Overview

RecipeVault follows a modular full-stack architecture:
Frontend (React + TypeScript)
|
| REST API
v
Backend (Node.js + Express)
|
| Prisma ORM
v
PostgreSQL Database



\## Backend Architecture



The backend follows a layered Express architecture:



* \*\*Routes\*\* - Define API endpoints and apply middleware
* \*\*Middleware\*\* - Reusable validation and error handling
* \*\*Controllers\*\* - Business logic and database interaction
* \*\*Validators\*\* - Zod schemas for request validation
* \*\*Config\*\* - Infrastructure setup (Prisma client)



Validation is handled using \*\*Zod\*\*, ensuring runtime safety and structured error responses.



Errors are processed through a centralized error handler to maintain consistent API responses.



\## API Design Principles



* Schema-based validation using Zod
* Centralized error handling middleware
* RESTful route structure
* Consistent JSON error responses
* Separation of configuration, routing, and business logic



\## Project Structure



src/

&nbsp;  app.ts

&nbsp;  server.ts

&nbsp;  routes/

&nbsp;  controllers/

&nbsp;  validators/

&nbsp;  middleware/

&nbsp;  config/



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



\### Example: Create Recipe



POST /recipes



Request:

{

&nbsp; "name": "Spaghetti Bolognese"

}



Response:



201 Created



{

&nbsp; "id": "uuid",

&nbsp; "name": "Spaghetti Bolognese",

&nbsp; "createdAt": "timestamp"

}



\### Example: Create Recipe Error Response



400 Bad Request



{

&nbsp; "error": "Invalid request body",

&nbsp; "fields": {

&nbsp;   "name": {

&nbsp;     "message": "Recipe name is required"

&nbsp;   }

&nbsp; }

}



## Status



🚧 Actively in development



## Goals



* Demonstrate full-stack application design
* Work with structured and unstructured data
* Apply OCR and document-processing techniques in a production-style workflow
* Build a practical, user-focused feature set
