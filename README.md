# 📄 README — Live Project Demonstration Guide (DevOps + MLOps)

---

## 🎯 Goal

This guide helps you demonstrate a **complete end-to-end DevOps + MLOps system**, including:

* Docker (containerization)
* Kubernetes (deployment & orchestration)
* Ingress (external access)
* Replication & Load Balancing
* Auto Scaling (HPA)
* Self-Healing (fault tolerance)
* Jenkins CI/CD (automation)
* Prometheus (monitoring)
* Grafana (visualization)
* Frontend (end-to-end ML flow)

---

## 🧠 DEMO FLOW (IMPORTANT)

👉 Follow this exact order during presentation:

1. Kubernetes → prove system running
2. API → prove backend works
3. Ingress → show routing
4. Replication → manual scaling
5. Load Balancing → multiple pods serving
6. Auto Scaling → HPA demo
7. Self-Healing → failure simulation
8. Jenkins → CI/CD automation
9. Prometheus → monitoring
10. Grafana → visualization
11. Frontend → final product

---

# ☸️ STEP 1 — Show Kubernetes Running System

▶️ Command

```bash
kubectl get pods
```

🎯 Say
“These are my application pods running in Kubernetes — backend and database.”

---

▶️ Command

```bash
kubectl get svc
```

🎯 Say
“Services provide stable networking and enable communication between components.”

---

▶️ Command

```bash
kubectl get pods --all-namespaces
```

🎯 Say
“This shows all system, monitoring, and application components running in the cluster.”

---

# 🌍 STEP 2 — Show Backend Working (API Proof)

▶️ Command

```bash
curl http://sports.local/api/sightings/
```

🎯 Say
“This API returns predictions from my ML model stored in PostgreSQL.”

---

# 🌐 STEP 3 — Show Ingress (External Access)

▶️ Command

```bash
kubectl describe ingress sports-ingress
```

🎯 Say
“Ingress acts as a gateway routing external traffic to internal services.”

---

▶️ Explain flow

```text
User → sports.local → Ingress → Service → Pod
```

---

# ⚖️ STEP 4 — Replication (Manual Scaling)

▶️ Command

```bash
kubectl scale deployment sports-backend --replicas=3
```

▶️ Verify

```bash
kubectl get pods
```

🎯 Say
“I manually scaled my backend to multiple replicas, demonstrating horizontal scaling.”

---

# 🔁 STEP 5 — Load Balancing Proof

▶️ Open in browser

```text
http://sports.local/api/whoami
```

▶️ Refresh multiple times

🎯 Say
“Each request is handled by a different pod, proving load balancing via Kubernetes Service.”

---

# 📈 STEP 6 — Auto Scaling (HPA)

▶️ Command

```bash
kubectl get hpa
```

🎯 Say
“This is my Horizontal Pod Autoscaler which scales pods automatically based on CPU usage.”

---

▶️ Generate load

```bash
while true; do curl http://sports.local/api/whoami; done
```

▶️ Watch scaling

```bash
kubectl get pods -w
```

🎯 Say
“As traffic increases, Kubernetes automatically increases the number of pods.”

---

▶️ Stop load (CTRL + C)

🎯 Say
“When traffic decreases, the system automatically scales down to optimize resources.”

---

# 💥 STEP 7 — Self-Healing (Failure Simulation)

▶️ Command

```bash
kubectl delete pod <pod-name>
```

▶️ Watch

```bash
kubectl get pods -w
```

🎯 Say
“When a pod fails or is deleted, Kubernetes automatically recreates it, ensuring high availability.”

---

# 🤖 STEP 8 — Jenkins CI/CD (LIVE DEMO)

▶️ Open Jenkins

```text
http://localhost:8080
```

---

▶️ Start ngrok (if needed)

```bash
ngrok http 8080
```

---

▶️ Get ngrok URL

```bash
curl http://127.0.0.1:4040/api/tunnels
```

---

▶️ Update GitHub webhook

```text
https://<ngrok-url>/github-webhook/
```

---

▶️ Trigger pipeline

```bash
echo "# demo change" >> README.md
git add .
git commit -m "trigger CI/CD demo"
git push
```

🎯 Say
“This triggers Jenkins pipeline automatically using GitHub webhook.”

---

▶️ Show Jenkins stages

🎯 Say
“Jenkins builds the Docker image, pushes it, and deploys it to Kubernetes.”

---
▶️ Show Failure Case (Optional - Advanced Demo)

👉 (Only if you want to impress)

Break test intentionally:
```bash
self.assertEqual(response.status_code, 500)
```
Push code → show:

❌ Pipeline fails

🎯 Say:

“If tests fail, deployment is automatically stopped, ensuring only stable code reaches production.”
---

# 📊 STEP 9 — Prometheus Monitoring

▶️ Command

```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090
```

▶️ Open

```text
http://localhost:9090
```

---

▶️ Query

```text
django_http_requests_before_middlewares_total
```

▶️ Generate load

```bash
while true; do curl http://sports.local/api/sightings/; done
```

🎯 Say
“Prometheus collects real-time metrics from the backend.”

---

# 📈 STEP 10 — Grafana Visualization

▶️ Command

```bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```

▶️ Open

```text
http://localhost:3000
```

---

▶️ Query

```text
rate(django_http_requests_before_middlewares_total[1m])
```

🎯 Say
“Grafana visualizes metrics from Prometheus in real time.”

---

# 🌐 STEP 11 — Frontend Demo

▶️ Start frontend

```bash
cd react_frontend
npm run dev
```

▶️ Open

```text
http://localhost:5173
```

---

🎯 Demo flow

* Upload image
* Model predicts sport
* Data stored in database
* Results displayed

🎯 Say
“This demonstrates the complete end-to-end ML pipeline from user input to prediction.”

---

# 🧠 FINAL CLOSING (IMPORTANT)

Say this confidently:

> “This project demonstrates a complete DevOps and MLOps pipeline with Docker-based containerization, Kubernetes orchestration, CI/CD automation, monitoring, auto-scaling, and self-healing capabilities.”

---

# 🚀 Key Features Demonstrated

* Docker-based containerized application
* Kubernetes deployment & orchestration
* Horizontal scaling (replication)
* Load balancing via services
* Auto-scaling using HPA
* Self-healing infrastructure
* CI/CD pipeline with Jenkins
* Monitoring using Prometheus
* Visualization using Grafana
* End-to-end ML workflow

---
