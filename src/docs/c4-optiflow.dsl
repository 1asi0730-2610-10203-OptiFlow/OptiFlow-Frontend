workspace "OptiFlow" "Optical Shop Management System — Frontend SPA (C4 Model)" {

    model {

        # ──────────────────────────────────────────────
        # ACTORS
        # ──────────────────────────────────────────────
        employee = person "Optica Employee" "Admin, optometrist, sales advisor, lab technician, or receptionist who manages daily operations through the SPA."
        customer = person "Customer" "Optical shop client who tracks their own order status and pending balance via the self-service portal."

        # ──────────────────────────────────────────────
        # EXTERNAL SYSTEMS
        # ──────────────────────────────────────────────
        restApi = softwareSystem "OptiFlow REST API" "Backend REST API that persists and serves all business data. Exposes endpoints for sales, patients, work orders, inventory, and subscriptions." {
            tags "External System"
        }

        # ──────────────────────────────────────────────
        # OUR SYSTEM
        # ──────────────────────────────────────────────
        optiflow = softwareSystem "OptiFlow" "Web-based management platform for optical shops. Handles sales, clinical records, lab fulfillment, inventory, and subscription plans in a single SPA." {

            spa = container "OptiFlow SPA" "Vue 3 Single-Page Application structured with Domain-Driven Design bounded contexts. Uses Pinia for state management and Vue Router for client-side navigation." "Vue 3 + Pinia + Vue Router" {

                # ── Shared ───────────────────────────────────────────────────
                layout = component "Layout" "Shared shell component. Renders the sidebar navigation and wraps every bounded-context view through <router-view>. Entry point for all authenticated routes." "Vue.js Component (shared/presentation)"

                # ── Bounded Context overview nodes (used only in L3) ─────────
                salesBC        = component "Sales BC"        "Commercial flow: quotes, payments, discounts, returns, and CRM feedback surveys. (EP-03F)" "Vue.js Module" {
                    tags "BoundedContext"
                }
                clinicalBC     = component "Clinical BC"     "Patient registration, clinical records (HCE), prescriptions, and external exam uploads. (EP-02G)" "Vue.js Module" {
                    tags "BoundedContext"
                }
                fulfillmentBC  = component "Fulfillment BC"  "Lab work orders, Kanban board, and lens fabrication lifecycle tracking. (EP-04L)" "Vue.js Module" {
                    tags "BoundedContext"
                }
                inventoryBC    = component "Inventory BC"    "Product catalogue, stock management, suppliers, categories, and audit log. (EP-04L)" "Vue.js Module" {
                    tags "BoundedContext"
                }
                # ── Sales Bounded Context ────────────────────────────────────
                # EP-03F — Flujo Comercial, Finanzas y Fidelización (CRM)
                salesPresentation = component "Sales · Presentation" "Views: SaleList. Components: SaleTable, SaleFormModal, PaymentForm, FeedbackForm, SaleStatusBadge. Routes mapped to /sales." "Vue.js Views & Components" {
                    tags "Presentation"
                }
                salesApplication = component "Sales · Application" "sales.store.js — Pinia store. Orchestrates: list sales, create sale + lab order, register payment, apply discount, mark return, submit feedback survey." "Pinia Store" {
                    tags "Application"
                }
                salesInfrastructure = component "Sales · Infrastructure" "API clients: sales-api, payment-api, feedback-api. Assemblers (sale.assembler, payment.assembler, feedback.assembler) map HTTP JSON to domain objects. Resources wrap raw API shapes." "Axios / Fetch + Assemblers" {
                    tags "Infrastructure"
                }
                salesDomain = component "Sales · Domain" "Entities: Sale, SaleDetail, Payment, Feedback. Encapsulates sales business rules and value objects (status transitions, discount limits)." "JavaScript Classes" {
                    tags "Domain"
                }

                # ── Clinical Bounded Context ──────────────────────────────────
                # EP-02G — Gestión Clínica y Optometría
                clinicalPresentation = component "Clinical · Presentation" "Views: PatientList. Components: ModalAddPatient, ModalHCE, ModalNewExam, ModalSuccess. Routes mapped to /clinical." "Vue.js Views & Components" {
                    tags "Presentation"
                }
                clinicalApplication = component "Clinical · Application" "clinical.store.js — Pinia store. Manages patient CRUD, HCE queries, prescription registration, and external exam uploads." "Pinia Store" {
                    tags "Application"
                }
                clinicalInfrastructure = component "Clinical · Infrastructure" "API clients: patient-api, clinical-record-api, prescription-api. Assemblers map HTTP responses to domain entities." "Axios / Fetch + Assemblers" {
                    tags "Infrastructure"
                }
                clinicalDomain = component "Clinical · Domain" "Entities: Patient, ClinicalRecord, Prescription. Captures optometry examination rules and prescription constraints (e.g. Axis 0-180)." "JavaScript Classes" {
                    tags "Domain"
                }

                # ── Fulfillment Bounded Context ───────────────────────────────
                # EP-04L — Logística, Inventario y Laboratorio (lab side)
                fulfillmentPresentation = component "Fulfillment · Presentation" "Views: LabOrderList. Components: KanbanBoard, WorkOrderList, WorkOrderItem, NewWorkOrderModal, WorkOrderDetailModal. Routes mapped to /lab-orders." "Vue.js Views & Components" {
                    tags "Presentation"
                }
                fulfillmentApplication = component "Fulfillment · Application" "fulfillment.store.js — Pinia store. Loads work orders and laboratories; advances Kanban states (Pending → In Process → Quality Control → Ready → Delivered)." "Pinia Store" {
                    tags "Application"
                }
                fulfillmentInfrastructure = component "Fulfillment · Infrastructure" "API clients: work-order-api, laboratory-api. Assemblers map HTTP responses to domain entities." "Axios / Fetch + Assemblers" {
                    tags "Infrastructure"
                }
                fulfillmentDomain = component "Fulfillment · Domain" "Entities: WorkOrder, Laboratory. Encapsulates lens fabrication lifecycle, urgency priority rules, and rework tracking." "JavaScript Classes" {
                    tags "Domain"
                }

                # ── Inventory Bounded Context ─────────────────────────────────
                # EP-04L — Logística, Inventario y Laboratorio (inventory side)
                inventoryPresentation = component "Inventory · Presentation" "Views: InventoryList. Components: ModalAddProduct, ModalRestock, ModalBulkRestock, ModalAuditLog. Routes mapped to /inventory." "Vue.js Views & Components" {
                    tags "Presentation"
                }
                inventoryApplication = component "Inventory · Application" "inventory.store.js — Pinia store. Handles product CRUD, stock adjustments, supplier and category management, and audit log retrieval." "Pinia Store" {
                    tags "Application"
                }
                inventoryInfrastructure = component "Inventory · Infrastructure" "API clients: product-api, category-api, supplier-api. Assemblers map HTTP responses to domain entities." "Axios / Fetch + Assemblers" {
                    tags "Infrastructure"
                }
                inventoryDomain = component "Inventory · Domain" "Entities: Product, Category, Supplier. Encapsulates stock threshold alerts and reorder business rules." "JavaScript Classes" {
                    tags "Domain"
                }

                # ─────────────────────────────────────────────────────────────
                # BC-LEVEL RELATIONSHIPS (for L3 overview only)
                # ─────────────────────────────────────────────────────────────
                salesBC        -> layout  "All views render inside the layout shell" "Vue <router-view>"
                salesBC        -> restApi "Manages /sales, /payments, /feedbacks"    "HTTPS / REST"
                clinicalBC     -> layout  "All views render inside the layout shell" "Vue <router-view>"
                clinicalBC     -> restApi "Manages /patients, /clinical-records, /prescriptions" "HTTPS / REST"
                fulfillmentBC  -> layout  "All views render inside the layout shell" "Vue <router-view>"
                fulfillmentBC  -> restApi "Manages /work-orders, /laboratories"      "HTTPS / REST"
                inventoryBC    -> layout  "All views render inside the layout shell" "Vue <router-view>"
                inventoryBC    -> restApi "Manages /products, /categories, /suppliers" "HTTPS / REST"
                # ─────────────────────────────────────────────────────────────
                # RELATIONSHIPS — Sales Bounded Context
                # ─────────────────────────────────────────────────────────────
                salesPresentation    -> layout               "Renders inside shared layout shell"              "Vue <router-view>"
                salesPresentation    -> salesApplication     "Reads reactive state; dispatches store actions"  "Pinia composable (useStore)"
                salesApplication     -> salesDomain          "Creates and manipulates domain entities"
                salesApplication     -> salesInfrastructure  "Delegates outbound HTTP calls"
                salesInfrastructure  -> salesDomain          "Converts HTTP JSON to entities via assemblers"
                salesInfrastructure  -> restApi              "GET/POST/PATCH /sales, /payments, /feedbacks"    "HTTPS / REST"

                # ─────────────────────────────────────────────────────────────
                # RELATIONSHIPS — Clinical Bounded Context
                # ─────────────────────────────────────────────────────────────
                clinicalPresentation    -> layout                  "Renders inside shared layout shell"             "Vue <router-view>"
                clinicalPresentation    -> clinicalApplication     "Reads reactive state; dispatches store actions" "Pinia composable (useStore)"
                clinicalApplication     -> clinicalDomain          "Creates and manipulates domain entities"
                clinicalApplication     -> clinicalInfrastructure  "Delegates outbound HTTP calls"
                clinicalInfrastructure  -> clinicalDomain          "Converts HTTP JSON to entities via assemblers"
                clinicalInfrastructure  -> restApi                 "GET/POST /patients, /clinical-records, /prescriptions" "HTTPS / REST"

                # ─────────────────────────────────────────────────────────────
                # RELATIONSHIPS — Fulfillment Bounded Context
                # ─────────────────────────────────────────────────────────────
                fulfillmentPresentation    -> layout                     "Renders inside shared layout shell"             "Vue <router-view>"
                fulfillmentPresentation    -> fulfillmentApplication     "Reads reactive state; dispatches store actions" "Pinia composable (useStore)"
                fulfillmentApplication     -> fulfillmentDomain          "Creates and manipulates domain entities"
                fulfillmentApplication     -> fulfillmentInfrastructure  "Delegates outbound HTTP calls"
                fulfillmentInfrastructure  -> fulfillmentDomain          "Converts HTTP JSON to entities via assemblers"
                fulfillmentInfrastructure  -> restApi                    "GET/POST/PATCH /work-orders, /laboratories"    "HTTPS / REST"

                # ─────────────────────────────────────────────────────────────
                # RELATIONSHIPS — Inventory Bounded Context
                # ─────────────────────────────────────────────────────────────
                inventoryPresentation    -> layout                    "Renders inside shared layout shell"             "Vue <router-view>"
                inventoryPresentation    -> inventoryApplication     "Reads reactive state; dispatches store actions" "Pinia composable (useStore)"
                inventoryApplication     -> inventoryDomain          "Creates and manipulates domain entities"
                inventoryApplication     -> inventoryInfrastructure  "Delegates outbound HTTP calls"
                inventoryInfrastructure  -> inventoryDomain          "Converts HTTP JSON to entities via assemblers"
                inventoryInfrastructure  -> restApi                  "GET/POST/PATCH /products, /categories, /suppliers" "HTTPS / REST"

            }
        }

        # ──────────────────────────────────────────────
        # CONTEXT-LEVEL RELATIONSHIPS
        # ──────────────────────────────────────────────
        employee -> optiflow "Manages sales, clinical records, lab orders, inventory, and system settings" "HTTPS"
        customer -> optiflow "Tracks order status and views pending balance via self-service portal"       "HTTPS"
        optiflow -> restApi  "All bounded contexts consume REST endpoints"                                 "HTTPS / REST"
    }

    views {

        # ════════════════════════════════════════════════════════════════════
        # LEVEL 1 — SYSTEM CONTEXT
        # Shows: OptiFlow system, actors, external REST API
        # ════════════════════════════════════════════════════════════════════
        systemContext optiflow "L1_SystemContext" "Actors who interact with OptiFlow and the external REST API it depends on." {
            include *
            autoLayout lr
            title "L1 — System Context: OptiFlow"
        }

        # ════════════════════════════════════════════════════════════════════
        # LEVEL 2 — CONTAINER
        # Shows: the single Vue 3 SPA container + REST API
        # ════════════════════════════════════════════════════════════════════
        container optiflow "L2_Containers" "The single Vue 3 SPA and its HTTPS connection to the backend REST API." {
            include *
            autoLayout lr
            title "L2 — Container: OptiFlow SPA"
        }

        # ════════════════════════════════════════════════════════════════════
        # LEVEL 3 — COMPONENTS (all bounded contexts inside the SPA)
        # Each bounded context is one component; shared Layout is also shown.
        # ════════════════════════════════════════════════════════════════════
        component spa "L3_Components" "Each DDD bounded context as a component, plus the shared Layout shell that wraps them all." {
            include salesBC clinicalBC fulfillmentBC inventoryBC layout restApi
            autoLayout lr
            title "L3 — Components: Bounded Contexts inside the OptiFlow SPA"
        }

        # ════════════════════════════════════════════════════════════════════
        # LEVEL 4 — DDD LAYERS PER BOUNDED CONTEXT
        # One view per bounded context showing Presentation → Application
        # → Infrastructure → Domain layers and how they interact with
        # the shared Layout component and the external REST API.
        # ════════════════════════════════════════════════════════════════════

        component spa "L4_Sales" "DDD layers of the Sales bounded context (EP-03F) and their interactions." {
            include salesPresentation salesApplication salesInfrastructure salesDomain layout restApi
            autoLayout tb
            title "L4 — Sales Bounded Context: DDD Layers"
        }

        component spa "L4_Clinical" "DDD layers of the Clinical bounded context (EP-02G) and their interactions." {
            include clinicalPresentation clinicalApplication clinicalInfrastructure clinicalDomain layout restApi
            autoLayout tb
            title "L4 — Clinical Bounded Context: DDD Layers"
        }

        component spa "L4_Fulfillment" "DDD layers of the Fulfillment bounded context (EP-04L, lab side) and their interactions." {
            include fulfillmentPresentation fulfillmentApplication fulfillmentInfrastructure fulfillmentDomain layout restApi
            autoLayout tb
            title "L4 — Fulfillment Bounded Context: DDD Layers"
        }

        component spa "L4_Inventory" "DDD layers of the Inventory bounded context (EP-04L, stock side) and their interactions." {
            include inventoryPresentation inventoryApplication inventoryInfrastructure inventoryDomain layout restApi
            autoLayout tb
            title "L4 — Inventory Bounded Context: DDD Layers"
        }

        # ════════════════════════════════════════════════════════════════════
        # STYLES
        # ════════════════════════════════════════════════════════════════════
        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Software System" {
                background #1168BD
                color #ffffff
            }
            element "External System" {
                background #6B6B6B
                color #ffffff
            }
            element "Container" {
                background #438DD5
                color #ffffff
            }
            element "Component" {
                background #85BBF0
                color #000000
            }
            element "BoundedContext" {
                background #438DD5
                color #ffffff
                shape RoundedBox
            }
            element "Presentation" {
                background #2E7D32
                color #ffffff
            }
            element "Application" {
                background #E65100
                color #ffffff
            }
            element "Infrastructure" {
                background #AD1457
                color #ffffff
            }
            element "Domain" {
                background #4527A0
                color #ffffff
            }
        }
    }
}
