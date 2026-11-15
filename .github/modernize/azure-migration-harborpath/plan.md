# Modernization Plan: HarborPath Azure Migration

**Project**: Harborpath

## Technical Framework

- **Primary runtime**: Node.js 20+ (ES modules); JavaScript browser client
- **Additional component**: Python backend with FastAPI dependencies; its role and
  deployment status need confirmation
- **Build tools**: npm / Node.js test runner; Python requirements
- **Current hosting**: Vercel, with an existing Node.js Dockerfile
- **Database and external services**: Not fully established from this assessment
- **Assessment metadata language**: `java` is retained for pipeline compatibility
  with the Java AppCAT report; it does not mean Java is the primary runtime.

## Overview

HarborPath is to be prepared for and moved from its current hosting arrangement
to Azure. The migration should retain the current product behavior, accessibility,
and privacy guarantees, while making the deployment and operational boundaries
of each active application component explicit.

The current AppCAT report is not a comprehensive assessment of this application.
The plan therefore treats deployment as a scoped first phase, not as proof that
all dependencies, data services, or application components have been assessed.
Any unassessed component or external dependency must be validated before its
production migration is considered complete.

## Migration Impact Summary

| Application | Original Service | New Azure Service | Authentication | Comments |
|-------------|------------------|-------------------|----------------|----------|
| HarborPath web/server | Vercel/Node host | Azure Container Apps | Managed identity where needed | Existing Node Dockerfile |
| Python backend | Local/repository component | Azure Container Apps, if active | Managed identity where needed | Role and lifecycle unconfirmed |

Azure Container Apps is the planning default. No Azure resource configuration or
provisioned environment was found in the repository; the target environment and
whether new resources may be provisioned must be confirmed before deployment.

## Assessment Findings and Limitations

The provided report (`report-20261111173716`) was produced by the Java AppCAT
workflow and reports one rule with 21 incidents, all categorized as AWS
credential configuration. Its paths are under `.venv/Lib/site-packages/` in
Celery/Kombu package files. A source check did not find corresponding AWS
credential configuration in the application's `src`, `backend`, or server
entry point. These package-internal findings are not treated as confirmed
application-code issues or used to invent an AWS service migration task.

The report lists Python, JavaScript, and Java, but its Java AppCAT workflow did
not comprehensively assess the Node.js application or Python backend. As a
result, this plan does not claim that their dependencies, service integrations,
security posture, data stores, or Azure readiness have been fully assessed.
The Python backend's production role and the use of its declared database,
Redis, and Celery dependencies remain unverified. No Java Maven/Gradle project
was found at the repository root.

## Open Questions & Questionnaire

- [x] Q: Should infrastructure be provisioned? → A: No new IaC/provisioning task
  is planned by default; no Azure infrastructure configuration was found.
- [x] Q: Should integration testing be included? → A: Yes, mock mode is the
  questionnaire default because no Azure test environment was supplied.
- [x] Q: Should security/CVE remediation be included? → A: Yes, the default.
- [x] Q: Which Azure deployment target? → A: Azure Container Apps, the default.
- [x] Q: Should there be a separate containerization task? → A: No; Container
  Apps deployment includes containerization, and the Node.js Dockerfile already
  exists.
- [ ] Confirm whether the Python backend is an active production component and
  whether it must be deployed with the web/server component.
- [ ] Confirm the Azure Container Apps environment/resource, region, and whether
  provisioning new Azure resources is authorized before deployment.

## Security Compliance

Scan and remediate known vulnerabilities across the application dependency
manifests, including Node.js and Python dependencies. Validate the resulting
builds and tests. The AppCAT package-internal credential findings should be
rechecked against the actual application source and dependency behavior rather
than assumed to be hard-coded application credentials.

## Migration Risks and Acceptance

- Preserve the existing privacy model: client-side sensitive answers must not
  become server-side telemetry or logs as a side effect of hosting migration.
- Confirm proxy and rate-limit configuration, health checks, static-data
  packaging, and external API behavior in the target Azure environment.
- Confirm whether the Python backend is deployed, connected to the public
  application, or an inactive/prototype component before treating its deployment
  as in-scope production work.
- Complete a Node.js/Python-focused assessment before making claims that the
  whole repository has been assessed or before selecting additional Azure data,
  messaging, or identity services.

The migration should be considered ready for production only after the active
components are identified, the Azure environment is confirmed, security checks
pass, and the deployment verification succeeds.
