# NeuroCommerce AI - Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to provide a comprehensive, detailed, and unambiguous architectural and functional description of the NeuroCommerce AI platform. This document serves as the single source of truth for all stakeholders, including executive sponsors, enterprise software architects, product managers, frontend developers (Next.js/React), backend developers (Laravel/PHP), machine learning engineers (PyTorch/FastAPI), quality assurance testers, and DevOps engineers. 

NeuroCommerce AI is a next-generation, AI-driven enterprise e-commerce platform that leverages a modular monolith architecture. It is designed to provide hyper-personalized shopping experiences, scalable catalog management, robust order processing, and comprehensive administrative controls. This SRS explicitly defines the functional requirements, non-functional requirements, external interfaces, system constraints, and AI specific operations to ensure the system is built to production-ready enterprise standards (Quality Goal: 100/100 Architecture Score).

This document details the system boundary, the 19 core modules, and the strict adherence to the defined technology stack (Laravel 12, PHP 8.4, Next.js 16, React 19, TypeScript, TailwindCSS v4) and clean architecture principles. It provides deep architectural guidance intended to preempt technical debt and align cross-functional teams around a shared technical vision. The strict adherence to enterprise design patterns—such as the Repository Pattern, Service Layer Pattern, and Domain-Driven Design bounded contexts—is non-negotiable.

### 1.2 Scope
The scope of NeuroCommerce AI encompasses the complete development, testing, and deployment of a B2C/B2B capable enterprise e-commerce platform. The system is architected as an Enterprise Modular Monolith to allow logical separation of bounded contexts while maintaining the operational simplicity of a single deployment unit, with a clear path to microservices abstraction if required.

The platform includes 19 distinct modules:
1. **Website:** Public-facing storefront, handling static routing, SEO metadata, landing pages, and initial user acquisition flows.
2. **CMS:** Content Management System for dynamic pages, blog posts, asset management, and promotional banner configurations.
3. **Admin Dashboard:** Centralized control panel for platform administrators, offering real-time KPIs, global search, and system health metrics.
4. **Authentication:** Secure identity and access management (IAM) using Laravel Sanctum, implementing Argon2id hashing and Spatie Permissions.
5. **Catalog:** Comprehensive management of products, variants, categories, brands, specifications, and complex pricing rules.
6. **Inventory:** Real-time stock tracking, multi-warehouse support, reservations during checkout, and low-stock alerting.
7. **Orders:** End-to-end order lifecycle management, state machine progression, line-item management, and refund processing.
8. **Checkout:** Secure, transactional, saga-orchestrated multi-step purchase flow, including cart validation, shipping calculation, and tax assessment.
9. **Payments:** Integration with external payment gateways (Stripe, PayPal), intent creation, webhook processing, capturing, and fraud detection bridging.
10. **Shipping:** Logistics orchestration, rate calculation, shipping zones, fulfillment status mapping, and tracking link generation.
11. **Customers:** Customer profile management, address books, segmentation, lifetime value tracking, and order history viewing.
12. **Wishlist:** Save-for-later, favorite functionalities, public/private list sharing, and seamless cart migration.
13. **Reviews:** Moderated user-generated product ratings, feedback text, verified purchase badges, and aggregate score calculation.
14. **Recommendations:** AI-driven product suggestions, collaborative filtering, content-based suggestions, and personalized recommendation grids.
15. **Analytics:** Platform telemetry, sales tracking, user behavior insights, funnel analysis, and drop-off identification.
16. **Reporting:** Asynchronous generation of data exports (CSV/Excel), financial summaries, sales reports, and tax compliance documents.
17. **Notifications:** Omnichannel transactional messaging orchestrator (Email via SendGrid, SMS via Twilio, In-App alerts).
18. **Settings:** Global store configuration, currency management, locale localization, tax rules, and feature toggles.
19. **AI Engine:** The core intelligence layer powering advanced search ranking, product recommendations, behavioral telemetry ingestion, and automated insights via a PyTorch/FastAPI microservice.

The scope explicitly EXCLUDES the development of custom accounting software (ERP integration is out of scope for v1, though APIs exist) and physical point-of-sale (POS) hardware integration.

### 1.3 Definitions, Acronyms, and Abbreviations
| Term / Acronym | Definition |
|----------------|------------|
| **AI / ML** | Artificial Intelligence / Machine Learning, specifically referring to the PyTorch/FastAPI recommendation and personalization engine. |
| **API** | Application Programming Interface (RESTful JSON structure following strict enterprise constraints). |
| **B2B / B2C** | Business-to-Business / Business-to-Consumer operational modes. |
| **BFF** | Backend-for-Frontend, a pattern potentially utilized in the Next.js API routes for aggregating Laravel API calls. |
| **CMS** | Content Management System for managing static and dynamic site content. |
| **DTO** | Data Transfer Object, used to pass data across architectural layer boundaries without exposing underlying Eloquent models. |
| **ERP** | Enterprise Resource Planning software (e.g., SAP, NetSuite). |
| **GDPR** | General Data Protection Regulation (EU privacy law compliance). |
| **IAM** | Identity and Access Management. |
| **JSON** | JavaScript Object Notation. |
| **KPI** | Key Performance Indicator. |
| **Modular Monolith**| An architecture where all code is deployed as a single application, but strictly separated into independent modules (bounded contexts) using interfaces and domain events. |
| **PCI DSS** | Payment Card Industry Data Security Standard. System aims for SAQ-A compliance via hosted fields. |
| **Pest** | PHP testing framework used for backend feature, unit, and architecture testing. |
| **Playwright** | End-to-end testing framework for frontend applications. |
| **PSR-12** | PHP Standard Recommendation for coding style. |
| **RBAC** | Role-Based Access Control, managed via Spatie Permissions. |
| **Saga Pattern** | An architectural pattern for managing distributed transactions or complex multi-step processes (e.g., checkout) without distributed locks. |
| **Sanctum** | Laravel's authentication system for SPAs and simple APIs. |
| **SKU** | Stock Keeping Unit, the unique identifier for a purchasable item variant. |
| **SOLID** | Five principles of object-oriented programming (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion). |
| **SPA** | Single Page Application (built with Next.js App Router). |
| **UUID** | Universally Unique Identifier (v7 used for chronological sorting and clustered index optimization). |
| **Zod** | TypeScript-first schema declaration and validation library for frontend form and API response validation. |

### 1.4 References
- `00-MASTER-INSTRUCTIONS.md` - Core project stack, quality goals, and unyielding development rules.
- `02-Enterprise-Architecture.md` - Enterprise architecture, layering, clean architecture enforcement, and modular breakdown.
- `04-REST-API-Specification.md` - REST API contract, endpoints, idempotency strategies, and standard data structures.
- IEEE Std 830-1998 - IEEE Recommended Practice for Software Requirements Specifications.
- Laravel 12 Documentation (laravel.com/docs)
- Next.js 16 Documentation (nextjs.org/docs)
- PyTorch Documentation (pytorch.org/docs)

### 1.5 Overview
The remainder of this document is organized as follows:
- **Section 2** provides an overall description of the system, including perspective, functions, user characteristics, and constraints.
- **Section 3** details the specific functional requirements for each of the 19 core modules in extensive detail, documenting over 150 individual functional specifications.
- **Section 4** outlines the external interface requirements (UI, Hardware, Software, Communication).
- **Section 5** defines the non-functional requirements (Performance, Security, Quality, Compliance) with strict measurement criteria.
- **Section 6** details the AI/ML specific requirements, crucial for the intelligence layer of the platform, including latency and operational targets.
- **Section 7** contains appendices including traceability and glossary.

---

## 2. Overall Description

### 2.1 Product Perspective
NeuroCommerce AI operates as a decoupled, headless e-commerce solution. The backend (Laravel 12) functions strictly as a REST API provider, managing business logic, state, and database interactions through clearly defined API contracts. The frontend (Next.js 16) is a standalone application communicating exclusively via this API, ensuring complete separation of concerns. The AI Engine operates as an independent microservice (FastAPI/PyTorch) consumed by the Laravel backend via internal HTTP/gRPC calls, isolating intensive computational workloads from standard web request handling.

```text
+---------------------------------------------------------+
|                    CLIENT DEVICES                       |
|  (Desktop Browser, Mobile Browser, Tablet, API Clients) |
+---------------------------+-----------------------------+
                            | HTTPS / REST
+---------------------------v-----------------------------+
|               PRESENTATION LAYER (Next.js 16)           |
|  - React 19, TailwindCSS v4, Framer Motion, Zustand     |
|  - TanStack Query, React Hook Form, Zod                 |
+---------------------------+-----------------------------+
                            | HTTPS / REST
+---------------------------v-----------------------------+
|              APPLICATION LAYER (Laravel 12)             |
|  - Enterprise Modular Monolith (19 Bounded Contexts)    |
|  - Clean Architecture (Controllers -> Services -> Repos)|
|  - Laravel Sanctum, Spatie Permissions, Form Requests   |
+---+-----------------------+-------------------------+---+
    |                       |                         |
+---v---+               +---v---+                 +---v---+
| MySQL |               | Redis |                 | AI    |
| 8.4   |               | Cache/|                 | Model |
|       |               | Queue |                 | (PyTorch)
+-------+               +-------+                 +-------+
```

### 2.2 Product Functions
The system comprises 19 distinct modules, each representing a bounded context with specific functions:

| Module | Core Functions |
|--------|----------------|
| **Website** | Rendering storefront, dynamic routing, SEO metadata, landing pages, SSR/SSG optimization. |
| **CMS** | Dynamic page creation, blog posts, asset management, banner configurations, headless content delivery. |
| **Admin Dashboard** | Centralized KPI overview, global search, activity monitoring, quick actions, widget customization. |
| **Authentication** | User registration, login, JWT token issuance (Sanctum), role/permission checks, password resets. |
| **Catalog** | CRUD for Products, Categories, Brands, Attributes, Variants, bulk import/export, pricing logic. |
| **Inventory** | Stock levels, warehouse assignment, stock movement logs, low stock alerts, reservation locks. |
| **Orders** | Order creation, status progression (state machine), line-item management, refund processing, invoicing. |
| **Checkout** | Saga-orchestrated multi-step purchase flow, cart validation, tax calculation, shipping rate fetching. |
| **Payments** | Gateway integration (Stripe), intent creation, webhook processing, capturing, idempotency handling. |
| **Shipping** | Rate calculation, shipping zones, fulfillment status mapping, tracking link generation, label printing prep. |
| **Customers** | Profile management, address books, segmentation, order history viewing, GDPR data exports. |
| **Wishlist** | Adding/removing items, sharing wishlists, moving items to cart, stock availability alerts for wishlists. |
| **Reviews** | Ratings submission, content moderation workflows, aggregate score calculation, verified purchase verification. |
| **Recommendations** | Collaborative filtering, content-based suggestions, personalized grids, "Frequently Bought Together". |
| **Analytics** | Tracking page views, behavioral events, conversion funnels, sales aggregation, custom report building. |
| **Reporting** | Background generation of data exports (CSV/Excel), financial summaries, sales reports, scheduled delivery. |
| **Notifications** | Event-driven dispatch of transactional emails, SMS, in-app alerts, customizable notification templates. |
| **Settings** | Global store config, currency, locale, tax rules, feature toggles, third-party API key management. |
| **AI Engine** | Python microservice for model inference, behavioral telemetry ingestion, real-time personalization. |

### 2.3 User Characteristics

| User Type | Expertise | Frequency of Use | Key Concerns |
|-----------|-----------|------------------|--------------|
| **Customer (Guest)** | Low-Medium | Variable | Fast load times, easy navigation, secure checkout, clear pricing, no forced registration. |
| **Customer (Registered)** | Low-Medium | Frequent | Order tracking, personalized recommendations, quick reorder, saved addresses, saved payment methods. |
| **Store Manager** | Medium-High | Daily | Order processing efficiency, inventory accuracy, catalog updates, analytics dashboard clarity. |
| **Administrator / Super Admin** | High | Daily | System configuration, user role management, system health, audit logs, feature flags, backups. |
| **Marketing Manager** | Medium | Weekly | CMS updates, promotional banners, analytics reports, conversion rates, SEO optimization. |
| **API Consumer / Integration** | High (Technical) | Automated | API rate limits, response payload predictability, uptime, secure authentication, comprehensive documentation. |

### 2.4 Constraints
* **C-01 (Architecture):** The system MUST adhere to a strict Modular Monolith architecture. No cross-module Eloquent relationships are permitted. All cross-module communication must happen via Domain Events or explicit interface contracts.
* **C-02 (Language):** Backend MUST use PHP 8.4 with strict typing declarations (`declare(strict_types=1);`). Frontend MUST use TypeScript in strict mode. JavaScript is strictly forbidden.
* **C-03 (Database):** Schema migrations are immutable once deployed. Data integrity must be enforced at the database level (foreign keys, constraints, enums) AND application level.
* **C-04 (API):** The REST API MUST adhere to the established JSON response contracts defined in `04-REST-API-Specification.md`, ensuring uniform payload structures across all endpoints.
* **C-05 (Performance):** Backend API response times MUST NOT exceed 200ms for 95th percentile requests under load (excluding external API calls).
* **C-06 (Security):** System MUST strictly follow PCI DSS guidelines; no raw credit card data shall touch or be stored in the database. Tokenization via Stripe Elements is mandatory.
* **C-07 (Testing):** Test coverage MUST exceed 85% for business logic (Services/Repositories). Feature tests must cover all core HTTP API endpoints.
* **C-08 (Deployment):** The application MUST be containerizable via Docker and orchestration-ready for Kubernetes.
* **C-09 (State):** API MUST remain completely stateless between requests (JWT Bearer tokens only). No server-side session files.
* **C-10 (Design):** The UI MUST use TailwindCSS v4 and provide a premium, modern, responsive experience with micro-animations via Framer Motion.
* **C-11 (Dependencies):** Inversion of Control MUST be used. Infrastructure dependencies must be injected via interfaces bound in Laravel Service Providers.
* **C-12 (Data Layer):** The Repository Pattern MUST be used for all database access. Controllers and Services must not call Eloquent directly.
* **C-13 (Business Logic):** The Service Pattern MUST be used for all business logic. Controllers must remain thin, only handling HTTP request/response orchestration.
* **C-14 (Validation):** Form Requests MUST be used for inbound data validation. Zod MUST be used for frontend validation mirroring backend rules.
* **C-15 (Serialization):** API Resources MUST be used for outbound data serialization to prevent over-fetching and model leakage.

### 2.5 Assumptions and Dependencies
* **A-01:** Users have modern web browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled.
* **A-02:** The system will be hosted on a scalable infrastructure (e.g., AWS, DigitalOcean) capable of running Docker containers, MySQL 8.4, and Redis.
* **A-03:** The AI Service is available via HTTP/gRPC within the internal network and responds within 100ms.
* **A-04:** Third-party services (Stripe, SendGrid) maintain 99.9% uptime.
* **A-05:** Redis is configured for high availability (Redis Sentinel/Cluster) as it handles critical queue processing and idempotency keys.
* **D-01:** Dependent on Stripe for all payment processing, 3D Secure verification, and tokenization.
* **D-02:** Dependent on Redis for caching, session management (if any), and background queue workers (Laravel Horizon).
* **D-03:** Dependent on Laravel Scout (with Elasticsearch or Meilisearch) for full-text search capabilities across the catalog.
* **D-04:** Dependent on Laravel Sanctum for secure API token management.
* **D-05:** Dependent on PyTorch for model training and inference in the AI microservice.

---

## 3. System Features

### 3.1 Website Module
**Description:** Handles the public storefront, SSR/SSG rendering, routing, and SEO.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-WEB-001 | The system shall render the dynamic homepage with CMS-driven banners. | High | Given a valid request, homepage is rendered via SSR within 300ms, incorporating active CMS banner configurations. |
| FR-WEB-002 | The system shall process incoming requests for static landing pages. | Medium | Given a slug, system returns statically generated Next.js page content for SEO performance. |
| FR-WEB-003 | The system shall generate comprehensive meta tags for SEO (OpenGraph, Twitter Cards). | High | Given a product or category route, the system injects contextual `<meta>` tags accurately mapping to resource details. |
| FR-WEB-004 | The system shall redirect legacy URLs via an internal redirect manager. | Medium | Given an outdated URL pattern, the system issues a 301 Permanent Redirect to the updated slug location. |
| FR-WEB-005 | The system shall handle 404 pages gracefully with AI-driven alternative suggestions. | Low | Given an invalid route, the system displays a localized 404 UI and triggers a recommendation fetch for similar content. |
| FR-WEB-006 | The system shall support multi-language routing (/en/, /es/). | Medium | Given a language prefix, the system dynamically swaps localization strings and fetches translated CMS content. |
| FR-WEB-007 | The system shall render the global header and footer navigation menus. | High | Given any storefront route, the system pulls cached menu hierarchies from the CMS and renders them seamlessly. |
| FR-WEB-008 | The system shall process progressive web app (PWA) manifest generation. | Low | Given a request to `/manifest.json`, system returns valid JSON conforming to PWA standards. |
| FR-WEB-009 | The system shall render a responsive design across desktop, tablet, and mobile breakpoints. | High | Given different viewport sizes, TailwindCSS utility classes appropriately collapse menus and stack grid layouts. |
| FR-WEB-010 | The system shall provide an optimized image delivery pipeline. | High | Given image assets, Next.js `<Image>` component automatically serves WebP formats with proper `srcSet` generation. |

**Stimulus/Response Sequence:**
1. Client initiates a request to the Next.js frontend route.
2. Next.js triggers a `getServerSideProps` or `getStaticProps` sequence, making an internal call to the `/api/v1/website` endpoints.
3. The `WebsiteController` intercepts the request and retrieves cached site state.
4. If a cache miss occurs, the `WebsiteService` queries the database via the `WebsiteRepository`.
5. The API returns a formatted JSON payload.
6. The Next.js UI renders the DOM incorporating SEO tags and structural HTML.

### 3.2 CMS Module
**Description:** Manages dynamic content, pages, blogs, and promotional banners.
**Priority:** Medium

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-CMS-001 | The system shall allow admins to create rich-text static pages. | High | Given valid input, a new page entity is stored and a corresponding unique URL slug is generated. |
| FR-CMS-002 | The system shall manage promotional banner carousels with active date ranges. | High | Given a banner configuration, the system automatically displays and hides banners based on `start_date` and `end_date`. |
| FR-CMS-003 | The system shall provide a blog post publishing workflow (Draft, Review, Published). | Medium | Given a post update, the status transitions appropriately and the post becomes publicly accessible only when 'Published'. |
| FR-CMS-004 | The system shall process image uploads to an external object storage bucket (S3). | High | Given an image file, system uploads to S3, returns public URL, and stores asset metadata in the database. |
| FR-CMS-005 | The system shall handle hierarchical navigation menu building. | Medium | Given a drag-and-drop menu update, the system persists the parent-child relationships and clears the menu cache. |
| FR-CMS-006 | The system shall generate XML sitemaps automatically based on CMS content. | Medium | Given a request to `sitemap.xml`, system generates a compliant XML feed including products, categories, and pages. |
| FR-CMS-007 | The system shall support localized versions of CMS pages. | Medium | Given an existing page, an admin can create a translated replica associated with a specific locale code. |
| FR-CMS-008 | The system shall allow assignment of SEO metadata overrides per page. | High | Given specific meta descriptions/titles, the system prioritizes these overrides over dynamically generated ones. |
| FR-CMS-009 | The system shall track revision history for CMS content blocks. | Low | Given a content update, the system saves the previous state to a `cms_revisions` table for audit/rollback purposes. |
| FR-CMS-010 | The system shall manage frequently asked questions (FAQ) blocks. | Low | Given FAQ entries, the system formats them with proper JSON-LD schema for Google rich snippets. |

**Stimulus/Response Sequence:**
1. Admin user submits a CMS page update via the Admin Dashboard UI.
2. The `CmsController` validates the payload (e.g., Markdown content, slug uniqueness).
3. The Controller delegates to the `CmsService` to perform the update.
4. The `CmsService` updates the database via the `CmsRepository` and invalidates relevant Redis caches.
5. The `PageUpdatedEvent` is dispatched for audit logging.
6. A success DTO is returned to the admin interface.

### 3.3 Admin Dashboard Module
**Description:** Provides centralized control and analytics for store administrators.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-ADM-001 | The system shall generate real-time KPI overview widgets (Sales, Orders, Users). | High | Given an admin dashboard load, system aggregates daily KPIs in <200ms and returns standard JSON payload. |
| FR-ADM-002 | The system shall support a global omni-search bar for quick entity lookup. | High | Given a search string (e.g., an Order ID or Customer Email), system searches across multiple indexes and returns categorized results. |
| FR-ADM-003 | The system shall log all administrative actions in an immutable Audit Log. | High | Given any mutation request by an admin, system records the User ID, action, timestamp, old state, and new state. |
| FR-ADM-004 | The system shall provide customizable data tables with server-side pagination, sorting, and filtering. | High | Given specific query parameters, system utilizes Eloquent query scopes to return precisely filtered datasets. |
| FR-ADM-005 | The system shall provide quick-action shortcuts (e.g., "Fulfill Order", "Restock"). | Medium | Given a quick action execution, system bypasses deep navigation and executes the command directly via API. |
| FR-ADM-006 | The system shall support exporting data table views to CSV/Excel. | Medium | Given an export request, system queues a background job, generates the file, and provides a download link. |
| FR-ADM-007 | The system shall present visual sales charts using chart.js or Recharts. | Medium | Given a date range, system returns aggregated time-series data formatted for frontend charting libraries. |
| FR-ADM-008 | The system shall display system health metrics (Queue size, Cache hit rate). | Low | Given a request to health endpoints, system polls Redis and Horizon to report current infrastructure status. |
| FR-ADM-009 | The system shall manage admin user profiles and avatar uploads. | Medium | Given a profile update, system secures the admin's personal details and updates the interface. |
| FR-ADM-010 | The system shall broadcast urgent notifications to connected admin users. | Low | Given a critical event (e.g., Payment Gateway Offline), system pushes a WebSocket or polling alert to the dashboard. |

### 3.4 Authentication Module
**Description:** Manages user identity, registration, login, and Role-Based Access Control.
**Priority:** Critical

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-AUT-001 | The system shall register new customers securely using Argon2id hashing. | Critical | Given a valid registration payload, user is created, password hashed securely, and a Welcome Email dispatched. |
| FR-AUT-002 | The system shall authenticate users via email and password, issuing a Laravel Sanctum JWT. | Critical | Given valid credentials, system returns a Bearer token and User DTO; on invalid, returns 401 Unauthorized. |
| FR-AUT-003 | The system shall enforce Role-Based Access Control (RBAC) on protected endpoints. | Critical | Given a request to an admin route by a user lacking the required Spatie Permission, system returns 403 Forbidden. |
| FR-AUT-004 | The system shall support secure password reset flows via emailed tokens. | High | Given a forgot-password request, system generates a time-limited token, emails it, and allows password resetting upon validation. |
| FR-AUT-005 | The system shall invalidate (revoke) tokens upon explicit logout. | High | Given a logout request, system deletes the corresponding Sanctum personal access token from the database. |
| FR-AUT-006 | The system shall lock out accounts after 5 consecutive failed login attempts. | High | Given repeated failed logins, system rate limits the IP and email address for 15 minutes. |
| FR-AUT-007 | The system shall support session invalidation across all devices. | Medium | Given a security request, user can instantly revoke all active Sanctum tokens associated with their account. |
| FR-AUT-008 | The system shall enforce strong password policies (min 8 chars, mixed case, numbers). | High | Given a weak password during registration or reset, the validation layer rejects the payload with 422 Unprocessable Entity. |
| FR-AUT-009 | The system shall verify email addresses post-registration. | Medium | Given a new registration, account is marked 'unverified' until the user clicks a secure email link. |
| FR-AUT-010 | The system shall integrate with OAuth2 providers (Google, GitHub) for social login. | Low | Given a social callback, system matches or provisions a user account based on the verified external email address. |

### 3.5 Catalog Module
**Description:** Handles products, variants, categories, brands, and pricing rules.
**Priority:** Critical

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-CAT-001 | The system shall support CRUD operations for Products with complex JSON attributes. | Critical | Given a product payload, system persists base details, SEO metadata, and dynamic attribute-value pairs. |
| FR-CAT-002 | The system shall manage Product Variants (e.g., Size, Color) with independent SKUs and pricing. | Critical | Given variant definitions, system creates child product records linked to a parent, ensuring unique SKUs. |
| FR-CAT-003 | The system shall manage nested, hierarchical Categories (up to 3 levels deep). | High | Given a category tree modification, system utilizes nested set or materialized path logic to maintain hierarchy integrity. |
| FR-CAT-004 | The system shall process asynchronous bulk product imports via CSV. | Medium | Given a CSV upload, system queues a job to parse, validate, and batch-insert products, providing progress tracking. |
| FR-CAT-005 | The system shall calculate active sale pricing based on `compare_at_price` logic. | High | Given a product view, system correctly identifies active discounts and computes the final display price. |
| FR-CAT-006 | The system shall sync all active products to the Elasticsearch indexing engine. | High | Given a product update/creation, system dispatches a `SyncProductToSearchIndex` job to update the Elasticsearch cluster. |
| FR-CAT-007 | The system shall manage Brands and associate them with products. | Medium | Given a brand association, system allows filtering the product catalog by that brand slug. |
| FR-CAT-008 | The system shall handle multiple product image uploads and primary image selection. | High | Given image assets, system associates them with the product entity and tracks the `is_primary` flag. |
| FR-CAT-009 | The system shall support product bundling (selling multiple SKUs as a single unit). | Medium | Given a bundle definition, system tracks component SKUs and aggregates inventory availability. |
| FR-CAT-010 | The system shall allow products to be marked as 'Draft', 'Active', or 'Archived'. | High | Given a state transition, system instantly updates visibility on the storefront (Drafts return 404 to public). |

### 3.6 Inventory Module
**Description:** Tracks stock levels, handles reservations, and manages warehouses.
**Priority:** Critical

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-INV-001 | The system shall track absolute stock quantities per unique SKU. | Critical | Given a stock adjustment, system precisely increments/decrements the integer stock value. |
| FR-INV-002 | The system shall support temporary stock reservations during the checkout flow. | Critical | Given a checkout initiation, system reserves stock (decreasing available, increasing reserved) for 15 minutes. |
| FR-INV-003 | The system shall automatically release expired stock reservations. | High | Given a cron schedule (every minute), system scans and releases reservations older than the TTL. |
| FR-INV-004 | The system shall prevent overselling by enforcing strict database-level locking during checkout. | Critical | Given concurrent purchase attempts for limited stock, system uses pessimistic locking (`lockForUpdate()`) to serialize transactions. |
| FR-INV-005 | The system shall maintain an immutable ledger of all stock movements. | High | Given any change to stock levels, a `stock_movement` record is created noting the delta, reason, and user/order ID. |
| FR-INV-006 | The system shall trigger notifications when stock falls below a configurable 'Low Stock Threshold'. | Medium | Given a stock decrement below the threshold, system dispatches an alert to store managers. |
| FR-INV-007 | The system shall support tracking inventory across multiple physical warehouses/locations. | Low | Given a multi-warehouse setup, stock is tracked per SKU-Location pair, with routing logic selecting the optimal fulfillment center. |
| FR-INV-008 | The system shall allow backordering for designated products. | Medium | Given a backorder-enabled product, checkout proceeds even if physical stock is <= 0, marking the order appropriately. |
| FR-INV-009 | The system shall allow bulk inventory adjustments via CSV upload. | Medium | Given a stocktake CSV, system processes deltas and generates corresponding movement ledger entries. |
| FR-INV-010 | The system shall synchronize stock levels with external ERP systems (API Hooks). | Low | Given a stock change, system fires a webhook payload to registered external ERP endpoints. |

### 3.7 Orders Module
**Description:** Manages the complete lifecycle of an order from placement to fulfillment.
**Priority:** Critical

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-ORD-001 | The system shall create an immutable Order record upon successful checkout orchestration. | Critical | Given a validated cart and payment, system generates an order with a unique, human-readable ID (e.g., #ORD-10293). |
| FR-ORD-002 | The system shall transition orders through a strict state machine (Pending -> Paid -> Processing -> Shipped -> Delivered). | Critical | Given an update request, system validates state transitions (e.g., cannot move from 'Pending' directly to 'Delivered'). |
| FR-ORD-003 | The system shall associate precise line items, capturing price at the moment of purchase. | Critical | Given an order creation, line items lock in the purchase price, ignoring future catalog price changes. |
| FR-ORD-004 | The system shall calculate and persist order-level totals, tax allocations, and shipping fees. | Critical | Given order creation, the exact arithmetic breakdown of subtotal, taxes, shipping, and total is permanently recorded. |
| FR-ORD-005 | The system shall support order cancellations and trigger inventory restocking. | High | Given a cancellation before fulfillment, system updates state to 'Cancelled' and releases reserved/deducted stock. |
| FR-ORD-006 | The system shall process partial or full order refunds via the Payment Gateway API. | High | Given a refund request, system communicates with Stripe to refund funds and updates order status to 'Refunded'. |
| FR-ORD-007 | The system shall generate PDF invoices dynamically for customer download. | Medium | Given a request to `/invoice`, system utilizes DomPDF to generate a compliant tax invoice on the fly. |
| FR-ORD-008 | The system shall maintain an internal order timeline/notes section for customer service agents. | Medium | Given an admin note addition, system logs the text, author, and timestamp visible only in the admin dashboard. |
| FR-ORD-009 | The system shall link guest orders to registered accounts if the email matches post-purchase. | Low | Given a new registration, system retroactively associates previous guest orders matching the verified email. |
| FR-ORD-010 | The system shall dispatch `OrderPlaced` and `OrderStatusUpdated` domain events for external module consumption. | High | Given an order mutation, events are fired allowing Notification and Analytics modules to react asynchronously. |

### 3.8 Checkout Module
**Description:** Orchestrates the multi-step, transactional purchase process.
**Priority:** Critical

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-CHK-001 | The system shall orchestrate the checkout Saga (Cart Validate -> Reserve Stock -> Process Payment -> Create Order). | Critical | Given a checkout submission, system executes the Saga; if any step fails, previous steps (like stock reservations) are cleanly rolled back. |
| FR-CHK-002 | The system shall validate cart integrity (prices, stock, coupon validity) immediately prior to processing. | Critical | Given a checkout request, system re-fetches live catalog data to ensure no price manipulation or stockouts occurred during the session. |
| FR-CHK-003 | The system shall calculate dynamic shipping rates based on the provided delivery address. | High | Given an address payload, system queries the Shipping module/API to return valid shipping options and costs. |
| FR-CHK-004 | The system shall calculate applicable taxes dynamically based on regional tax rules. | High | Given an address and cart contents, system computes precise tax liabilities (e.g., VAT, Sales Tax) per line item. |
| FR-CHK-005 | The system shall enforce `Idempotency-Key` tracking for all checkout requests. | Critical | Given a duplicate POST request with the same Idempotency-Key within 24 hours, system returns the cached response without double-processing. |
| FR-CHK-006 | The system shall support guest checkout without requiring account creation. | High | Given a guest payload, system processes the order using the provided email and creates an ephemeral customer profile. |
| FR-CHK-007 | The system shall securely pass payment intents to the frontend for Stripe Elements rendering. | Critical | Given an initialization request, system generates a Stripe PaymentIntent and returns the client secret to the frontend. |
| FR-CHK-008 | The system shall apply active coupon codes and recalculate cart totals instantly. | High | Given a valid coupon string, system applies discount logic (percentage or fixed) and returns updated checkout math. |
| FR-CHK-009 | The system shall validate address structures (ZIP code formats, state codes). | Medium | Given an address submission, form request validation ensures structural integrity before saving. |
| FR-CHK-010 | The system shall gracefully handle payment failures and allow the user to retry without losing cart state. | High | Given a declined card, system returns a specific 422 error, preserves the cart, and allows immediate retry. |

### 3.9 Payments Module
**Description:** Integrates with Stripe/PayPal to capture funds securely.
**Priority:** Critical

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-PAY-001 | The system shall communicate securely with the Stripe API using secret server-side keys. | Critical | Given a payment command, system uses the Stripe PHP SDK to interact with the gateway securely. |
| FR-PAY-002 | The system shall support asynchronous payment confirmation via Webhooks. | Critical | Given a Stripe webhook event (`payment_intent.succeeded`), system verifies the signature and updates the local order state to 'Paid'. |
| FR-PAY-003 | The system shall never store full credit card numbers (PCI DSS compliance). | Critical | Given a purchase, the system only stores the gateway's opaque token (e.g., `pi_12345`) and the last 4 digits for reference. |
| FR-PAY-004 | The system shall handle multi-currency conversions. | Medium | Given a non-base currency transaction, system converts the amount based on configured exchange rates before gateway submission. |
| FR-PAY-005 | The system shall support multiple payment methods (Credit Card, Apple Pay, Google Pay). | High | Given a frontend Stripe Elements implementation, system correctly processes alternate payment methods abstracted by the gateway. |
| FR-PAY-006 | The system shall process partial refunds against the original payment intent. | High | Given a refund command, system issues a partial refund API call to Stripe and records the transaction ID. |
| FR-PAY-007 | The system shall verify Stripe webhook signatures to prevent spoofing. | Critical | Given an incoming webhook payload, system uses the `STRIPE_WEBHOOK_SECRET` to mathematically verify authenticity before processing. |
| FR-PAY-008 | The system shall log all communication with external payment gateways for audit purposes. | High | Given an API call to Stripe, system logs the request ID, status, and truncated payload (masking any sensitive data). |
| FR-PAY-009 | The system shall handle 3D Secure authentication flows. | High | Given a card requiring 3DS, system correctly processes the `requires_action` state and orchestrates the frontend redirect loop. |
| FR-PAY-010 | The system shall support manual offline payments (e.g., Bank Transfer) with admin verification. | Low | Given a Bank Transfer selection, system places order in 'Pending Payment' state until an admin manually marks it as paid. |

### 3.10 Shipping Module
**Description:** Calculates rates, manages zones, and handles tracking information.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-SHP-001 | The system shall define geographic shipping zones (e.g., Domestic, Europe, Rest of World). | High | Given an admin setup, system correctly maps incoming postal codes/countries to the configured shipping zones. |
| FR-SHP-002 | The system shall calculate shipping rates based on weight, cart value, or flat fees. | High | Given a cart and zone, system iterates through active shipping rules to present accurate delivery options to the user. |
| FR-SHP-003 | The system shall support "Free Shipping" thresholds (e.g., Free over $100). | High | Given a cart total exceeding the threshold, system overrides standard rates and offers a $0 shipping option. |
| FR-SHP-004 | The system shall integrate with external carrier APIs (e.g., Shippo, EasyPost) for live rates. | Medium | Given an address, system performs an API call to carriers to fetch real-time FedEx/UPS/USPS rates. |
| FR-SHP-005 | The system shall store and expose package tracking numbers to customers. | High | Given an admin entering a tracking number, system associates it with the order and exposes a clickable tracking link. |
| FR-SHP-006 | The system shall process partial shipments (fulfilling an order in multiple boxes). | Medium | Given an order, system allows splitting line items into separate 'Shipment' entities, each with its own tracking code. |
| FR-SHP-007 | The system shall generate printable packing slips for warehouse staff. | Medium | Given a shipment, system generates a streamlined PDF detailing items, quantities, and addresses, omitting pricing. |
| FR-SHP-008 | The system shall automatically update order status to 'Delivered' via carrier webhooks. | Low | Given a webhook from EasyPost indicating delivery, system updates the internal shipment and order state automatically. |
| FR-SHP-009 | The system shall restrict shipping to blacklisted countries or regions. | High | Given an address in a restricted region, checkout validation explicitly blocks the purchase with a clear error message. |
| FR-SHP-010 | The system shall calculate estimated delivery dates based on processing time and carrier transit estimates. | Medium | Given a selected shipping method, system displays a calculated ETA range (e.g., "Arrives Oct 12 - Oct 15"). |

### 3.11 Customers Module
**Description:** Manages user profiles, address books, and customer segmentation.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-CUS-001 | The system shall maintain an extended Customer Profile (Avatar, Phone, Preferences) linked to the Auth User. | High | Given a profile update request, system safely mutates the profile data independently of core authentication credentials. |
| FR-CUS-002 | The system shall support a multi-entry Address Book per customer. | High | Given an address payload, system allows customers to save, edit, and delete multiple shipping/billing addresses. |
| FR-CUS-003 | The system shall allow customers to designate default shipping and billing addresses. | High | Given a 'set default' command, system updates the boolean flags, ensuring only one default exists per type. |
| FR-CUS-004 | The system shall calculate and display Customer Lifetime Value (LTV) in the admin dashboard. | Medium | Given an admin viewing a customer, system dynamically sums the total value of all 'Paid' orders associated with the user. |
| FR-CUS-005 | The system shall support customer segmentation based on rules (e.g., VIP = Spent > $1000). | Low | Given a segmentation sync job, system tags users automatically based on behavioral and purchasing heuristics. |
| FR-CUS-006 | The system shall process GDPR Data Export requests. | Medium | Given an export request, system queues a job to compile all PII and order history into a downloadable JSON/ZIP format. |
| FR-CUS-007 | The system shall process GDPR Account Deletion requests. | High | Given a deletion request, system soft-deletes the user, anonymizes PII in historical orders, and removes them from marketing lists. |
| FR-CUS-008 | The system shall expose a paginated order history interface for the customer portal. | High | Given a request to `/api/v1/customer/orders`, system returns the user's orders sorted by newest first. |
| FR-CUS-009 | The system shall manage opt-in/opt-out states for marketing communications. | High | Given a preference update, system respects the boolean flag and synchronizes state with external email providers (e.g., Mailchimp). |
| FR-CUS-010 | The system shall allow admins to impersonate customer accounts for troubleshooting (Super Admin only). | Low | Given an impersonation command, system issues a temporary token allowing the admin to view the frontend as the customer. |

### 3.12 Wishlist Module
**Description:** Allows users to save products for later and share lists.
**Priority:** Medium

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-WSH-001 | The system shall allow authenticated users to add/remove products to a wishlist. | High | Given a valid product ID, system creates or deletes the association in the `wishlist_items` table. |
| FR-WSH-002 | The system shall support guest wishlists via local storage / session IDs. | Medium | Given a guest session, wishlist data is stored and subsequently merged into the user account upon login/registration. |
| FR-WSH-003 | The system shall expose a 'Move to Cart' functionality. | High | Given a command, system copies the item to the cart and removes it from the wishlist in a single transaction. |
| FR-WSH-004 | The system shall allow users to create multiple named wishlists (e.g., "Birthday", "Tech"). | Low | Given a list creation payload, system scaffolds a new named list associated with the user. |
| FR-WSH-005 | The system shall support generating public shareable links for wishlists. | Low | Given a 'share' command, system generates a unique hash URL allowing unauthenticated read-only access to the list. |
| FR-WSH-006 | The system shall display stock status (In Stock / Out of Stock) for wishlisted items. | High | Given a wishlist fetch, system hydrates the items with real-time stock availability. |
| FR-WSH-007 | The system shall notify users when a wishlisted item goes on sale. | Low | Given a price drop, system identifies users who have the item wishlisted and dispatches a notification. |
| FR-WSH-008 | The system shall automatically remove items from the wishlist upon successful purchase. | Medium | Given a completed order, system scans the user's wishlist and removes items that were just bought. |
| FR-WSH-009 | The system shall provide aggregate data to admins on most-wishlisted products. | Medium | Given an admin report request, system groups and counts wishlist additions to highlight high-demand items. |
| FR-WSH-010 | The system shall limit the maximum number of items per wishlist to prevent abuse (e.g., max 500). | Low | Given an addition exceeding the threshold, system returns a 422 Unprocessable Entity with a clear error message. |

### 3.13 Reviews Module
**Description:** Handles user-generated product ratings and moderation workflows.
**Priority:** Medium

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-REV-001 | The system shall allow authenticated users to submit a 1-5 star rating and text review. | High | Given a valid payload, system stores the review associated with the user and the product. |
| FR-REV-002 | The system shall automatically flag reviews from users who actually bought the item with a 'Verified Purchase' badge. | High | Given a review submission, system checks the user's order history for the product ID and sets the boolean flag. |
| FR-REV-003 | The system shall implement a moderation workflow (Pending -> Approved -> Rejected). | High | Given a new review, it defaults to 'Pending' and is hidden from the public storefront until an admin approves it. |
| FR-REV-004 | The system shall asynchronously calculate and cache the aggregate average rating for a product. | High | Given a new approved review, system dispatches a job to recalculate the product's average score to optimize read performance. |
| FR-REV-005 | The system shall allow users to upload images alongside their text review. | Low | Given image files, system processes, resizes, and attaches the media to the review entity. |
| FR-REV-006 | The system shall allow customers to upvote helpful reviews. | Low | Given an upvote action, system increments the helpfulness counter, influencing default sorting order. |
| FR-REV-007 | The system shall prevent a single user from submitting multiple reviews for the same product. | Medium | Given a duplicate submission attempt, system returns a 409 Conflict indicating a review already exists. |
| FR-REV-008 | The system shall allow store owners to post public replies to customer reviews. | Medium | Given an admin reply, system attaches the response to the review entity and displays it distinctly on the storefront. |
| FR-REV-009 | The system shall automatically filter reviews containing profanity or blacklisted words. | Medium | Given a submission, system scans text against a blacklist and auto-rejects or flags for urgent manual review. |
| FR-REV-010 | The system shall solicit reviews automatically via email 14 days post-delivery. | Medium | Given a scheduled job, system finds delivered orders past the threshold and dispatches a "Leave a Review" notification. |

### 3.14 Recommendations Module (Integration with AI Engine)
**Description:** Serves AI-driven product suggestions and personalized content.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-REC-001 | The system shall fetch personalized product grids based on a User ID or Session ID. | High | Given a request to `/api/v1/recommendations/for-you`, system proxies the request to the AI microservice and returns the hydrated product DTOs. |
| FR-REC-002 | The system shall provide "Frequently Bought Together" suggestions. | High | Given a Product ID, system queries the AI engine for association rules and displays high-probability complementary items. |
| FR-REC-003 | The system shall provide "Similar Products" based on content embeddings. | Medium | Given a Product ID, system utilizes vector similarity search via the AI engine to return visually or textually similar products. |
| FR-REC-004 | The system shall implement a strict fallback mechanism if the AI service times out. | Critical | Given an AI service timeout (>150ms), system aborts the remote call and immediately returns a cached list of "Trending Products" from Redis. |
| FR-REC-005 | The system shall pass context (e.g., current cart contents) to the AI engine to refine real-time suggestions. | Medium | Given an active cart, the recommendation payload includes cart SKUs to prevent recommending items already intended for purchase. |
| FR-REC-006 | The system shall track Click-Through Rates (CTR) specifically for recommended items. | High | Given a click on a recommended product, system logs the event with a `source=recommendation` tag for ML feedback loops. |
| FR-REC-007 | The system shall allow admins to manually pin or boost specific products within recommendation carousels. | Medium | Given admin configurations, the AI output is post-processed to inject sponsored or overstocked items into the final array. |
| FR-REC-008 | The system shall support localized recommendations based on geographic telemetry. | Low | Given a user's IP region, system requests region-specific models from the AI engine (e.g., winter coats for cold climates). |
| FR-REC-009 | The system shall cache generic recommendation endpoints (e.g., "Trending Now") at the CDN edge. | High | Given a non-personalized request, system sets appropriate Cache-Control headers to offload traffic from the backend. |
| FR-REC-010 | The system shall execute background batch jobs to pre-compute recommendations for highly active users. | Low | Given a nightly cron schedule, system requests and caches tomorrow's recommendation sets for top tier users in Redis. |

### 3.15 Analytics Module
**Description:** Collects telemetry and generates insights on user behavior.
**Priority:** Medium

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-ANA-001 | The system shall expose a lightweight endpoint for frontend telemetry ingestion. | High | Given an event payload (e.g., `page_view`, `add_to_cart`), system accepts the JSON and queues it for asynchronous database insertion. |
| FR-ANA-002 | The system shall aggregate sales data into daily, weekly, and monthly time-series metrics. | High | Given a cron schedule, system summarizes order data into an `analytics_aggregations` table to power dashboard charts instantly. |
| FR-ANA-003 | The system shall track checkout funnel drop-off rates. | High | Given progression events (Cart -> Shipping -> Payment -> Success), system calculates the percentage loss at each step. |
| FR-ANA-004 | The system shall identify and report on the top-performing search queries. | Medium | Given search telemetry, system ranks queries by volume and tracks their subsequent conversion rates. |
| FR-ANA-005 | The system shall report on "Zero Result" search queries. | Medium | Given a search yielding no products, system explicitly logs the exact term so admins can adjust catalog keywords or synonyms. |
| FR-ANA-006 | The system shall track traffic sources (UTM parameters, Referrers) and associate them with orders. | High | Given UTM parameters in the session, system tags any resulting orders with the acquisition source for marketing ROI analysis. |
| FR-ANA-007 | The system shall calculate the Average Order Value (AOV) over configurable time periods. | High | Given a date range, system computes Total Revenue / Order Count accurately. |
| FR-ANA-008 | The system shall track device and browser statistics for optimization prioritization. | Low | Given incoming user agents, system categorizes and aggregates usage (e.g., 60% Mobile Safari, 40% Desktop Chrome). |
| FR-ANA-009 | The system shall anonymize IP addresses before permanent storage to comply with GDPR. | High | Given an IP (e.g., 192.168.1.100), system masks the final octet (192.168.1.0) before writing to analytical tables. |
| FR-ANA-010 | The system shall continuously stream aggregated behavioral data to the AI Engine for model training. | High | Given a batch of new events, system transmits a normalized payload to the FastAPI service via a background job. |

### 3.16 Reporting Module
**Description:** Generates asynchronous data exports and financial summaries.
**Priority:** Medium

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-REP-001 | The system shall generate comprehensive Order CSV exports based on date ranges and filters. | High | Given an export request, system queues a job, streams results to a file using generators to prevent OOM errors, and alerts the admin. |
| FR-REP-002 | The system shall generate Tax Summary reports detailing liabilities by jurisdiction. | High | Given a request, system aggregates tax collected grouped by region/country for accounting purposes. |
| FR-REP-003 | The system shall generate Inventory Valuation reports based on current stock and base costs. | Medium | Given a request, system computes Total Stock * Cost Price across the entire active catalog. |
| FR-REP-004 | The system shall support automated, scheduled report generation (e.g., Weekly Sales PDF). | Low | Given a schedule configuration, system runs the report job and emails the resulting file to designated admin addresses. |
| FR-REP-005 | The system shall securely store generated reports in private cloud storage (S3). | High | Given a completed report, file is saved to an internal bucket and served via signed, time-limited URLs to authorized admins only. |
| FR-REP-006 | The system shall clean up stale generated reports older than 30 days. | Low | Given a daily maintenance cron, system deletes old export files from S3 to minimize storage costs. |
| FR-REP-007 | The system shall generate Customer Cohort Analysis reports (retention over time). | Low | Given a request, system maps users by acquisition month and calculates their repeat purchase rate in subsequent months. |
| FR-REP-008 | The system shall generate Product Performance reports (Views vs. Cart Adds vs. Purchases). | Medium | Given a request, system merges telemetry data with catalog data to highlight high-conversion and low-conversion items. |
| FR-REP-009 | The system shall support exporting data in both CSV and JSON formats. | Low | Given a format parameter, the export job utilizes the appropriate serialization strategy. |
| FR-REP-010 | The system shall track which admin requested which report in the audit log. | Medium | Given a report generation execution, system records the user ID and report parameters for security auditing. |

### 3.17 Notifications Module
**Description:** Dispatches transactional emails, SMS, and in-app alerts.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-NOT-001 | The system shall dispatch an Order Confirmation email immediately upon successful checkout. | Critical | Given an `OrderPlaced` event, system queues an email rendering the order summary and transmits via SendGrid. |
| FR-NOT-002 | The system shall dispatch Shipping Update notifications when tracking numbers are added. | High | Given an `OrderShipped` event, system sends an email and/or SMS containing the carrier tracking link. |
| FR-NOT-003 | The system shall utilize Laravel's Notification Facade for multi-channel broadcasting. | High | Given a notification class, system determines user preferences and routes messages to Mail, SMS, or Database channels automatically. |
| FR-NOT-004 | The system shall render emails using responsive, branded HTML templates. | High | Given an email dispatch, system compiles Blade templates ensuring rendering compatibility across major email clients (Gmail, Outlook, Apple Mail). |
| FR-NOT-005 | The system shall support SMS notifications via Twilio for critical updates. | Medium | Given a valid phone number and user opt-in, system dispatches a concise text message payload to the Twilio API. |
| FR-NOT-006 | The system shall handle email bounces and spam complaints via webhooks. | Low | Given a bounce webhook from SendGrid, system marks the customer email as invalid and suppresses future sends to protect domain reputation. |
| FR-NOT-007 | The system shall send "Abandoned Cart" reminder emails after a configurable delay (e.g., 4 hours). | Medium | Given a scheduled job checking for stale carts with known emails, system dispatches a reminder template with a cart recovery link. |
| FR-NOT-008 | The system shall provide an in-app notification center for authenticated users in the Next.js portal. | Medium | Given database notifications, the frontend polls/fetches the unread count and displays alerts in a dropdown UI. |
| FR-NOT-009 | The system shall allow admins to customize email template text via the CMS module. | Low | Given a CMS update, system overrides the default language strings used in the compiled Blade notification templates. |
| FR-NOT-010 | The system shall queue all external API calls for notifications to prevent blocking web requests. | Critical | Given any notification dispatch, the execution is pushed to Redis and handled by Horizon workers, ensuring sub-50ms controller response times. |

### 3.18 Settings Module
**Description:** Manages global store configuration, taxes, currencies, and features.
**Priority:** Medium

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-SET-001 | The system shall provide a centralized repository for global store settings (Name, Contact Email, Currency). | High | Given a request to `/api/v1/settings`, system returns a cached dictionary of public global configurations. |
| FR-SET-002 | The system shall securely store third-party API keys (Stripe, Twilio) encrypted in the database. | Critical | Given an admin updating an API key via the dashboard, system encrypts the string before saving and decrypts it only at runtime. |
| FR-SET-003 | The system shall support feature toggles (Feature Flags) to enable/disable specific platform functionality. | High | Given an admin toggling "Enable Guest Checkout", system instantly alters validation rules and frontend rendering logic based on the flag. |
| FR-SET-004 | The system shall manage global tax rules and percentage rates per geographic region. | High | Given a tax configuration update, system applies the new rates to all future checkouts (historical orders remain unaffected). |
| FR-SET-005 | The system shall manage supported currencies and manual or automated exchange rates. | Medium | Given a currency update, system correctly applies the exchange multiplier to base prices on the frontend. |
| FR-SET-006 | The system shall invalidate the global settings cache immediately upon any modification. | High | Given a settings update, system flushes the specific Redis cache key, forcing the next request to pull fresh data from MySQL. |
| FR-SET-007 | The system shall allow configuration of automated maintenance mode. | Medium | Given a maintenance toggle, system intercepts all non-admin API requests and returns a 503 Service Unavailable with a generic message. |
| FR-SET-008 | The system shall support configuring shipping weight units (kg, lbs) and dimension units (cm, in). | Low | Given a configuration, all backend weight calculations and API outputs conform to the selected standard. |
| FR-SET-009 | The system shall allow configuration of legal documents (Terms of Service, Privacy Policy links). | Low | Given an update, the frontend footer and checkout consent checkboxes dynamically point to the correct URL slugs. |
| FR-SET-010 | The system shall restrict access to the Settings module exclusively to the 'Super Admin' role. | Critical | Given an access attempt by a standard 'Store Manager', system strictly rejects the request with 403 Forbidden. |

### 3.19 AI Engine Module
**Description:** Python-based intelligence layer for model inference and training.
**Priority:** High

**Functional Requirements:**
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-AIE-001 | The system shall expose a fast, RESTful inference API via FastAPI for the Laravel backend to consume. | Critical | Given a standard JSON request containing user context, the FastAPI service executes the PyTorch model and returns an array of recommended Product IDs in <100ms. |
| FR-AIE-002 | The system shall ingest normalized behavioral telemetry (views, carts, purchases) to update user feature vectors. | High | Given a telemetry payload, the service updates its in-memory or Redis-backed feature store for real-time personalization adjustments. |
| FR-AIE-003 | The system shall execute offline model retraining pipelines on a scheduled cadence (e.g., weekly). | High | Given a cron trigger, a secondary worker pulls historical data, trains a new model iteration, validates metrics (Precision, Recall), and saves the weights. |
| FR-AIE-004 | The system shall support hot-swapping model weights without dropping active inference requests. | High | Given a new validated model, the FastAPI server seamlessly reloads the `.pt` weights file in a thread-safe manner. |
| FR-AIE-005 | The system shall provide a semantic search embedding endpoint. | Medium | Given a search query string, the service utilizes an NLP model (e.g., SentenceTransformers) to return a dense vector for Elasticsearch KNN querying. |
| FR-AIE-006 | The system shall implement A/B testing support by serving different model versions based on a provided request hash. | Medium | Given a traffic allocation header, the service routes 10% of requests to a new experimental model and tags the response for downstream analytics tracking. |
| FR-AIE-007 | The system shall log model confidence scores alongside recommendations. | Low | Given an inference response, the payload includes the probability/score for each recommended item for debugging and dynamic thresholding. |
| FR-AIE-008 | The system shall expose a `/health` endpoint detailing model version, memory usage, and GPU status. | Medium | Given a health check ping from a load balancer, service returns 200 OK with internal diagnostic metrics. |
| FR-AIE-009 | The system shall isolate computationally expensive training tasks from the primary inference web server. | Critical | Given a training initiation, the process runs in a completely separate Docker container/process, ensuring the API remains highly responsive. |
| FR-AIE-010 | The system shall handle 'Cold Start' scenarios gracefully using fallback heuristics. | High | Given a request for a brand-new user with zero history, the model detects the lack of features and returns a pre-computed "Global Top Sellers" array. |

---
*End of SRS Document. This specification dictates the absolute architectural and functional truth for the NeuroCommerce AI platform.*
