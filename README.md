# 📄 README — Complete DevOps + MLOps Project Demonstration Guide

---

# 🎯 Project Overview

This project demonstrates a complete end-to-end **DevOps + MLOps architecture** for a Sports Image Classification application.

The system supports:

- Docker containerization
- Docker Compose orchestration
- Kubernetes deployment & orchestration
- HTTPS/TLS secured ingress
- Replication & Load Balancing
- Horizontal Pod Autoscaling (HPA)
- Self-Healing infrastructure
- Jenkins CI/CD pipeline
- Prometheus monitoring
- Grafana visualization
- Full-stack frontend + backend integration
- PostgreSQL database integration
- Machine Learning inference workflow

---

# 🧠 PROJECT ARCHITECTURE

## Kubernetes Architecture

```text
User
  ↓
HTTPS Ingress (sports.local)
  ↓
Kubernetes Services
  ↓
Frontend Pods ↔ Backend Pods ↔ PostgreSQL
```

---

## Docker Compose Architecture

```text
Frontend Container ↔ Backend Container ↔ PostgreSQL Container
```

---

# 🚀 TECHNOLOGIES USED

## Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication
- TensorFlow / ML Model

## Frontend
- React
- Vite
- TypeScript
- Nginx

## DevOps / Infrastructure
- Docker
- Docker Compose
- Kubernetes
- Minikube
- NGINX Ingress Controller
- Jenkins
- Prometheus
- Grafana
- Horizontal Pod Autoscaler (HPA)

---

# 🧠 DEMO FLOW (IMPORTANT)

👉 Follow this exact order during presentation:

1. Kubernetes → prove cluster running
2. API → prove backend works
3. HTTPS Ingress → show secure routing
4. Replication → multiple backend replicas
5. Load Balancing → requests served by different pods
6. Auto Scaling → HPA demo
7. Self-Healing → failure recovery
8. Jenkins → CI/CD automation
9. Prometheus → monitoring
10. Grafana → visualization
11. Frontend → end-to-end ML workflow
12. Docker Compose → multi-container orchestration

---

# 🔄 Deployment Environment Switching Guide

## 🎯 Why Environment Switching Is Needed

This project supports TWO deployment architectures:

| Environment | Purpose |
|---|---|
| Kubernetes | Production-style orchestration |
| Docker Compose | Local multi-container orchestration |

The frontend requires different backend API URLs depending on deployment mode.

---

# ☸️ Kubernetes Deployment Mode

## Frontend API URL

```env
VITE_API_URL=https://sports.local/api
```

---

## ▶️ Step 1 — Switch Frontend Environment

```bash
cp react_frontend/.env.kubernetes react_frontend/.env
```

---

## ▶️ Step 2 — Use Minikube Docker Environment

```bash
eval $(minikube docker-env)
```

---

## ▶️ Step 3 — Rebuild Frontend Image

```bash
docker build -t sports-frontend:latest ./react_frontend
```

---

## ▶️ Step 4 — Rebuild Backend Image

```bash
docker build -t sports-backend:latest ./django_backend
```

---

## ▶️ Step 5 — Restart Kubernetes Deployments

```bash
kubectl rollout restart deployment sports-frontend
```

```bash
kubectl rollout restart deployment sports-backend
```

---

## ▶️ Step 6 — Verify Pods

```bash
kubectl get pods
```

Wait until all pods become:

```text
Running
```

---

## ▶️ Step 7 — Open Kubernetes Application

```text
https://sports.local
```

---

# 🐳 Docker Compose Deployment Mode

## Frontend API URL

```env
VITE_API_URL=http://localhost:8000/api
```

---

## ▶️ Step 1 — Switch Frontend Environment

```bash
cp react_frontend/.env.compose react_frontend/.env
```

---

## ▶️ Step 2 — Build Compose Containers

```bash
docker compose build --no-cache
```

---

## ▶️ Step 3 — Start Compose Stack

```bash
docker compose up -d
```

---

## ▶️ Step 4 — Verify Running Containers

```bash
docker compose ps
```

---

## ▶️ Step 5 — Open Compose Application

```text
http://localhost:3000
```

---

# 🧠 Important Note About Frontend Builds

This project uses:

- React
- Vite
- Docker

Vite injects environment variables during image build time.

Therefore:

```text
Changing .env requires rebuilding frontend images.
```

---

# 🎯 Deployment Strategy Summary

| Feature | Kubernetes | Docker Compose |
|---|---|---|
| HTTPS | ✅ | ❌ |
| Ingress | ✅ | ❌ |
| HPA Autoscaling | ✅ | ❌ |
| Self-Healing | ✅ | ❌ |
| Jenkins CI/CD | ✅ | ❌ |
| Prometheus/Grafana | ✅ | ❌ |
| Multi-container orchestration | ✅ | ✅ |
| Persistent PostgreSQL | ✅ | ✅ |
| Frontend + Backend + DB integration | ✅ | ✅ |

---

# 🧠 Key Learning Outcome

This project demonstrates how the same application can support:

- Kubernetes orchestration
- Docker Compose orchestration
- Multi-environment deployment strategies
- Environment-aware frontend configuration
- Production-style DevOps workflows

# ☸️ STEP 1 — Show Kubernetes Running System

## ▶️ Show Pods

```bash
kubectl get pods
```

🎯 Say:

> “These are my Kubernetes application pods including frontend, backend, and PostgreSQL.”

---

## ▶️ Show Services

```bash
kubectl get svc
```

🎯 Say:

> “Services provide stable networking and internal communication between Kubernetes components.”

---

## ▶️ Show Complete Cluster

```bash
kubectl get pods --all-namespaces
```

🎯 Say:

> “This shows monitoring, ingress, application, and Kubernetes system components running together.”

---

# 🌍 STEP 2 — Show Backend Working (API Proof)

## ▶️ API Test

```bash
curl -k https://sports.local/api/sightings/
```

🎯 Say:

> “This API returns ML prediction records stored in PostgreSQL through the Django backend.”

---

# 🌐 STEP 3 — Show HTTPS Ingress Routing

## ▶️ Show Ingress

```bash
kubectl describe ingress sports-ingress
```

🎯 Say:

> “Ingress acts as an HTTPS gateway routing external traffic to Kubernetes services.”

---

## ▶️ Explain Routing Flow

```text
User → https://sports.local → Ingress (TLS) → Service → Pod
```

🎯 Highlight:

- HTTPS enabled using TLS
- Secure frontend/backend communication
- Internal Kubernetes routing

---

# ⚖️ STEP 4 — Replication (Manual Scaling)

## ▶️ Verify Replicas

```bash
kubectl get pods
```

🎯 Say:

> “The backend runs with multiple replicas demonstrating horizontal scaling and high availability.”

---

# 🔁 STEP 5 — Load Balancing Proof

## ▶️ Open in Browser

```text
https://sports.local/api/whoami/
```

Refresh multiple times.

🎯 Say:

> “Each request is served by different backend pods proving Kubernetes Service load balancing.”

---

# 📈 STEP 6 — Horizontal Pod Autoscaling (HPA)

## ▶️ Show HPA

```bash
kubectl get hpa
```

🎯 Say:

> “Horizontal Pod Autoscaler automatically scales backend replicas based on CPU utilization.”

---

## ▶️ Generate Load

```bash
while true; do
  curl -k https://sports.local/api/sightings/ > /dev/null &
done
```

---

## ▶️ Watch Scaling

```bash
kubectl get pods -w
```

🎯 Say:

> “As traffic increases, Kubernetes automatically scales backend pods.”

---

## ▶️ Stop Load

Press:

```text
CTRL + C
```

🎯 Say:

> “When traffic decreases, Kubernetes scales down automatically to optimize resources.”

---

# 💥 STEP 7 — Self-Healing Demonstration

## ▶️ Delete Pod

```bash
kubectl delete pod <pod-name>
```

---

## ▶️ Watch Recovery

```bash
kubectl get pods -w
```

🎯 Say:

> “Kubernetes automatically recreates failed pods ensuring high availability and fault tolerance.”

---

# 🤖 STEP 8 — Jenkins CI/CD Pipeline

## ▶️ Open Jenkins

```text
http://localhost:8080
```

---

## ▶️ Start ngrok (if needed)

```bash
ngrok http 8080
```

---

## ▶️ Get ngrok URL

```bash
curl http://127.0.0.1:4040/api/tunnels
```

---

## ▶️ Update GitHub Webhook

```text
https://<ngrok-url>/github-webhook/
```

---

## ▶️ Trigger CI/CD Pipeline

```bash
echo "# demo change" >> README.md
git add .
git commit -m "trigger CI/CD demo"
git push
```

🎯 Say:

> “GitHub webhook automatically triggers Jenkins pipeline after code push.”

---

## ▶️ Show Jenkins Pipeline Stages

🎯 Explain:

- Source checkout
- Backend testing
- Docker image build
- Docker image push
- Kubernetes deployment
- Rollout verification

🎯 Say:

> “Jenkins automates testing, image creation, registry push, and Kubernetes deployment.”

---

## ▶️ Optional Advanced Demo — Pipeline Failure

Break test intentionally:

```python
self.assertEqual(response.status_code, 500)
```

Push code and show:

❌ Pipeline failure

🎯 Say:

> “If tests fail, deployment is blocked automatically ensuring production stability.”

---

# 📊 STEP 9 — Prometheus Monitoring

## ▶️ Port Forward

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090
```

---

## ▶️ Open Prometheus

```text
http://localhost:9090
```

---

## ▶️ Query

```text
django_http_requests_before_middlewares_total
```

---

## ▶️ Generate Load

```bash
while true; do curl -k https://sports.local/api/sightings/; done
```

🎯 Say:

> “Prometheus collects real-time application metrics from the Django backend.”

---

# 📈 STEP 10 — Grafana Visualization

## ▶️ Port Forward

```bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```

---

## ▶️ Open Grafana

```text
http://localhost:3000
```

---

## ▶️ Query

```text
rate(django_http_requests_before_middlewares_total[1m])
```

🎯 Say:

> “Grafana visualizes Prometheus metrics in real time.”

---

# 🌐 STEP 11 — Frontend + ML Workflow Demo

## ▶️ Open Application

```text
https://sports.local
```

---

## ▶️ Demo Flow

- Register/Login
- Upload sports image
- ML model predicts sport
- Prediction stored in PostgreSQL
- Result displayed on frontend map/dashboard
- Location detection shown

🎯 Say:

> “This demonstrates the complete end-to-end MLOps workflow from user upload to ML inference and database persistence.”

---

# 🐳 STEP 12 — Docker Compose Demonstration

## ▶️ Explain Goal

🎯 Say:

> “I also implemented Docker Compose orchestration so the complete application can run outside Kubernetes using multi-container deployment.”

---

## ▶️ Show Compose File

```bash
cat docker-compose.yml
```

🎯 Explain:

- Frontend container
- Backend container
- PostgreSQL container
- Internal container networking
- Persistent database volume

---

## ▶️ Run Full Stack

```bash
docker compose up -d --build
```

---

## ▶️ Verify Running Containers

```bash
docker compose ps
```

🎯 Say:

> “Docker Compose automatically orchestrates frontend, backend, and database containers together.”

---

## ▶️ Open Compose Frontend

```text
http://localhost:3000
```

🎯 Demonstrate:

- Login
- Image upload
- Prediction
- Backend communication
- Database persistence

---

# 🧠 Environment Configuration Strategy

## Kubernetes Environment

```env
VITE_API_URL=https://sports.local/api
```

---

## Docker Compose Environment

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Environment Switching

### Kubernetes

```bash
cp react_frontend/.env.kubernetes react_frontend/.env
```

---

### Docker Compose

```bash
cp react_frontend/.env.compose react_frontend/.env
```

🎯 Say:

> “The project supports multiple deployment environments using separate environment configurations.”

---

# 🧠 FINAL CLOSING (IMPORTANT)

Say confidently:

> “This project demonstrates a complete DevOps and MLOps architecture including Docker containerization, Docker Compose orchestration, Kubernetes deployment, HTTPS ingress, CI/CD automation, monitoring, autoscaling, self-healing infrastructure, and end-to-end machine learning inference.”

---

# 🚀 Key Features Demonstrated

## DevOps Features

- Docker containerization
- Multi-stage Docker builds
- Docker Compose orchestration
- Kubernetes deployment & orchestration
- HTTPS/TLS ingress
- Horizontal scaling & replication
- Load balancing
- Horizontal Pod Autoscaling (HPA)
- Self-healing infrastructure
- Jenkins CI/CD pipeline
- GitHub webhook automation
- Prometheus monitoring
- Grafana visualization

---

## MLOps Features

- Machine learning inference pipeline
- Image classification workflow
- Prediction persistence
- End-to-end frontend integration
- PostgreSQL database integration
- Real-time API communication

---

# 🏆 Final Project Outcome

This project successfully demonstrates:

✅ DevOps automation
✅ MLOps workflow
✅ Full-stack deployment
✅ Container orchestration
✅ Monitoring & observability
✅ High availability
✅ Scalability
✅ CI/CD automation
✅ Production-style architecture

# demo change
