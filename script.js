// ================= GLOBAL VARIABLES =================
let patients = [];
let selectedPatientIndex = null;
let bpChart = null;

// ================= LOGIN =================
document.getElementById("loginBtn").addEventListener("click", function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username && password) {
        document.getElementById("loginPage").classList.add("d-none");
        document.getElementById("dashboardPage").classList.remove("d-none");

        document.getElementById("doctorWelcome").textContent =
            "Logged in as Dr. " + username;
    } else {
        alert("Please enter Doctor name and password");
    }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
    location.reload();
});

// ================= DARK MODE =================
document.getElementById("darkModeToggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        this.textContent = "☀ Light Mode";
    } else {
        this.textContent = "🌙 Dark Mode";
    }
});

// ================= PATIENT MANAGEMENT =================
document.getElementById("newPatientBtn").addEventListener("click", function () {
    const name = prompt("Enter Patient Name:");
    if (name) {
        patients.push({
            name: name,
            bpHistory: []
        });
        renderPatientList();
    }
});

function renderPatientList(filter = "") {
    const list = document.getElementById("patientList");
    list.innerHTML = "";

    patients.forEach((patient, index) => {
        if (patient.name.toLowerCase().includes(filter.toLowerCase())) {

            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action";
            li.textContent = patient.name;

            li.addEventListener("click", () => openPatientProfile(index));

            list.appendChild(li);
        }
    });
}

function openPatientProfile(index) {
    selectedPatientIndex = index;
    document.getElementById("patientProfile").classList.remove("d-none");
    document.getElementById("patientName").textContent = patients[index].name;
}

document.getElementById("backToDashboard").addEventListener("click", function () {
    document.getElementById("patientProfile").classList.add("d-none");
});

// ================= BP ANALYSIS =================
document.getElementById("analyzeBP").addEventListener("click", function () {
    const bpInput = document.getElementById("bpInput").value.trim();

    if (!bpInput.includes("/")) {
        alert("Enter BP in format systolic/diastolic (e.g. 160/100)");
        return;
    }

    const [systolic, diastolic] = bpInput.split("/").map(Number);

    if (isNaN(systolic) || isNaN(diastolic)) {
        alert("Invalid BP values");
        return;
    }

    const classification = classifyBP(systolic, diastolic);

    patients[selectedPatientIndex].bpHistory.push(systolic);

    updateRiskPanel(systolic, diastolic, classification);
    generateSOAP(systolic, diastolic, classification);
    updateChart();
});

// ================= BP CLASSIFICATION =================
function classifyBP(sys, dia) {
    if (sys >= 160 || dia >= 100) {
        return "Stage 2 Hypertension";
    } else if (sys >= 140 || dia >= 90) {
        return "Stage 1 Hypertension";
    } else {
        return "Normal Blood Pressure";
    }
}


function analyzeConsultation(text) {
    let insights = [];

    text = text.toLowerCase();

    if (text.includes("headache") || text.includes("dizziness")) {
        insights.push("⚠ Symptom detected: Possible hypertensive urgency.");
    }

    if (text.includes("missed medication") || text.includes("not taking")) {
        insights.push("⚠ Medication non-adherence identified.");
    }

    if (text.includes("diabetes")) {
        insights.push("⚠ Comorbidity detected: Increased cardiovascular risk.");
    }

    if (insights.length === 0) {
        insights.push("No major hypertension risk signals detected.");
    }

    document.getElementById("riskOutput").innerHTML =
        insights.join("<br>");
}

// ================= RISK PANEL =================
function updateRiskPanel(sys, dia, classification) {
    const riskPanel = document.getElementById("riskPanel");
    const riskOutput = document.getElementById("riskOutput");

    riskPanel.classList.remove("bg-success", "bg-warning", "bg-danger", "text-white", "text-dark");

    if (classification.includes("Stage 2")) {
        riskPanel.classList.add("bg-danger", "text-white");
    } else if (classification.includes("Stage 1")) {
        riskPanel.classList.add("bg-warning", "text-dark");
    } else {
        riskPanel.classList.add("bg-success", "text-white");
    }

    riskOutput.innerHTML = `
        <strong>Systolic:</strong> ${sys} mmHg<br>
        <strong>Diastolic:</strong> ${dia} mmHg<br>
        <strong>Classification:</strong> ${classification}
    `;
}

// ================= SOAP GENERATOR =================
function generateSOAP(sys, dia, classification) {
    const soapContent = document.getElementById("soapContent");

    soapContent.innerHTML = `
        <strong>Subjective:</strong><br>
        Patient presents for blood pressure evaluation.<br><br>

        <strong>Objective:</strong><br>
        Blood Pressure: ${sys}/${dia} mmHg<br><br>

        <strong>Assessment:</strong><br>
        ${classification}<br><br>

        <strong>Plan:</strong><br>
        Recommend lifestyle modification, salt reduction, exercise,
        and follow-up monitoring within 2 weeks.
    `;
}

// ================= CHART =================
function updateChart() {
    const ctx = document.getElementById("bpChart").getContext("2d");
    const history = patients[selectedPatientIndex].bpHistory;

    if (bpChart) {
        bpChart.destroy();
    }

    bpChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: history.map((_, i) => `Visit ${i + 1}`),
            datasets: [{
                label: "Systolic BP",
                data: history,
                borderColor: "red",
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains("dark-mode") ? "#fff" : "#000"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: document.body.classList.contains("dark-mode") ? "#fff" : "#000"
                    }
                },
                y: {
                    ticks: {
                        color: document.body.classList.contains("dark-mode") ? "#fff" : "#000"
                    }
                }
            }
        }
    });
}
// ================= VOICE RECOGNITION =================
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
}

const startBtn = document.getElementById("startVoice");
const stopBtn = document.getElementById("stopVoice");

if (startBtn) {
    startBtn.addEventListener("click", function () {
        if (!recognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        recognition.start();
        document.getElementById("consultationStatus").classList.remove("d-none");
        document.getElementById("consultationStatus").innerText =
            "Listening to doctor–patient conversation...";
    });
}

document.addEventListener("DOMContentLoaded", function () {

    const stopBtn = document.getElementById("stopVoice");

    if (stopBtn) {
        stopBtn.addEventListener("click", function () {

            const simulatedTranscript =
                "I have been having a headache for the past 3 days and I have been having a chronic feeling of dizziness. The patient is not taking any sort of medicine at the moment.";

            const transcriptBox = document.getElementById("transcribedNotes");

            transcriptBox.style.color = "black";
            transcriptBox.style.backgroundColor = "white";
            transcriptBox.textContent = simulatedTranscript;
        });
    }

});
if (recognition) {
    recognition.onresult = function (event) {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }

        document.getElementById("transcribedNotes").innerText = transcript;

        analyzeConsultation(transcript);
    };
}
// ================= PATIENT SEARCH =================
document.getElementById("searchPatient").addEventListener("input", function () {
    const searchValue = this.value.trim();
    renderPatientList(searchValue);
});