📄 README — Live Project Demonstration Guide (DevOps + MLOps)
🎯 Goal

This guide helps you demonstrate your already running project step-by-step:

Kubernetes (running system)
Ingress (external access)
Jenkins CI/CD (auto build)
Prometheus (monitoring)
Grafana (visualization)
Frontend (end-to-end ML flow)
🧠 DEMO FLOW (IMPORTANT)

👉 Follow this exact order during presentation:

1. Kubernetes → prove system running
2. API → prove backend works
3. Ingress → show routing
4. Jenkins → show CI/CD automation
5. Prometheus → show monitoring
6. Grafana → show visualization
7. Frontend → show final product
☸️ STEP 1 — Show Kubernetes Running System
▶️ Command
```bash
kubectl get pods
```
🎯 Say

“These are my application pods running in Kubernetes — backend and database.”

▶️ Command
```bash
kubectl get svc
```
🎯 Say

“Services provide stable networking between components inside the cluster.”

▶️ Command
```bash
kubectl get pods --all-namespaces
```
🎯 Say

“Across all namespaces, I have application, monitoring, ingress, and system pods running.”

🌐 STEP 2 — Show Ingress (External Access)
▶️ Command
```bash
kubectl describe ingress sports-ingress
```
🎯 Say

“Ingress acts as a gateway, routing external traffic from sports.local to my backend service.”

▶️ Explain flow
```text
User → sports.local → Ingress → Service → Pod
```
🌍 STEP 3 — Show Backend Working (API Proof)
▶️ Command
```bash
curl http://sports.local/api/sightings/
```
🎯 Say

“This API returns predictions made by my ML model, stored in the database.”

🤖 STEP 4 — Jenkins CI/CD (LIVE DEMO)
▶️ Step 4.1 — Open Jenkins

Open in browser:

```text
http://localhost:8080
```
▶️ Step 4.2 — Start ngrok (if not running)
```bash
ngrok http 8080
```
▶️ Step 4.3 — Get ngrok URL
```bash
curl http://127.0.0.1:4040/api/tunnels
```

👉 Copy:

```text
https://<ngrok-url>
```
▶️ Step 4.4 — Update GitHub Webhook

Go to:

GitHub → Settings → Webhooks

Update:

```text
https://<ngrok-url>/github-webhook/
```
▶️ Step 4.5 — Trigger pipeline
```bash
echo "# demo change" >> README.md
git add .
git commit -m "trigger CI/CD demo"
git push
```
🎯 Say

“This push triggers Jenkins automatically using GitHub webhook.”

▶️ Step 4.6 — Show Jenkins
Open pipeline
Show new build triggered
Open Console Output
🎯 Say

“Jenkins builds the Docker image, pushes it, and deploys it to Kubernetes automatically.”

📊 STEP 5 — Prometheus Monitoring
▶️ Start Prometheus access
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090
```
▶️ Open
```text
http://localhost:9090
```
▶️ Show targets

👉 Status → Targets

🎯 Say

“Prometheus is scraping metrics from my backend.”

▶️ Run query
```text
django_http_requests_before_middlewares_total
```
▶️ Generate traffic
```bash
while true; do curl http://sports.local/api/sightings/; done
```
🎯 Say

“Metrics increase in real time as traffic increases.”

📈 STEP 6 — Grafana Visualization
▶️ Start Grafana
```bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```
▶️ Open
```text
http://localhost:3000
```
▶️ Show dashboard

👉 Open your dashboard

🎯 Say

“Grafana visualizes Prometheus metrics in real time.”

▶️ Show query
```text
rate(django_http_requests_before_middlewares_total[1m])
```
▶️ Demo

Run:

```bash
while true; do curl http://sports.local/api/sightings/; done
```
🎯 Say

“This shows real-time request rate of my application.”

🌐 STEP 7 — Frontend Demo (FINAL)
▶️ Start frontend
```bash
cd react_frontend
npm run dev
```
▶️ Open
```text
http://localhost:5173
```
🎯 Demo flow
Upload image
Model predicts sport
Data stored
View results
🎯 Say

“This demonstrates end-to-end flow from user input to ML prediction and storage.”

🧠 FINAL CLOSING (IMPORTANT)

Say this confidently:

“This project demonstrates a complete DevOps and MLOps pipeline where deployment, automation, monitoring, and visualization are fully integrated.”