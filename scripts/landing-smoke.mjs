const html = await (await fetch("http://localhost:3000/")).text();
const checks = [
  "Available 24/7",
  "CRM Write-back",
  "Outbound Callbacks",
  "Plans that grow",
  "Questions teams ask first",
  "Loved by front desks",
  "Perfect for local operators",
  "Watch the live demo",
];
for (const item of checks) {
  console.log(item, html.includes(item));
}
const demo = await fetch("http://localhost:3000/demo");
console.log("demo", demo.status);
