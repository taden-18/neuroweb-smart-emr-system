import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class NeuroWeb1 {
    static Map<Integer, Patient> patients = new ConcurrentHashMap<>();
    static int nextId = 1;

    static class Patient {
        int id; String name; List<Integer> bpHistory = new ArrayList<>();
        Patient(int id, String name) { this.id = id; this.name = name; }

        String toJson() {
            return "{\"id\":" + id + ",\"name\":\"" + name + "\",\"bpHistory\":" + bpHistory + "}";
        }
    }

    public static void main(String[] args) throws IOException {
        // Add sample patient
        Patient p = new Patient(nextId++, "John Doe");
        p.bpHistory.addAll(Arrays.asList(145, 138, 152));
        patients.put(p.id, p);

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Handle all requests
        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();
            String response = "";
            int statusCode = 200;

            // Set CORS headers
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Content-Type", "application/json");

            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            // Handle different endpoints
            if ("/api/login".equals(path)) {
                response = "{\"message\":\"Logged in as Dr. User\"}";
            }
            else if ("/api/patients".equals(path)) {
                if ("GET".equals(exchange.getRequestMethod())) {
                    response = "[";
                    boolean first = true;
                    for (Patient patient : patients.values()) {
                        if (!first) response += ",";
                        response += patient.toJson();
                        first = false;
                    }
                    response += "]";
                }
                else if ("POST".equals(exchange.getRequestMethod())) {
                    // Read name from request body
                    String body = readBody(exchange);
                    String name = body.contains("name") ?
                            body.split("\"name\":\"")[1].split("\"")[0] : "Unknown";

                    Patient newPatient = new Patient(nextId++, name);
                    patients.put(newPatient.id, newPatient);
                    response = newPatient.toJson();
                    statusCode = 201;
                }
            }
            else if ("/api/bp-reading".equals(path) && "POST".equals(exchange.getRequestMethod())) {
                String body = readBody(exchange);

                // Simple parsing (for hackathon only!)
                int patientId = Integer.parseInt(body.split("\"patientId\":")[1].split(",")[0]);
                int sys = Integer.parseInt(body.split("\"systolic\":")[1].split(",")[0]);
                int dia = Integer.parseInt(body.split("\"diastolic\":")[1].split("}")[0]);

                Patient patient = patients.get(patientId);
                patient.bpHistory.add(sys);

                String classification = sys >= 160 ? "Stage 2 Hypertension" :
                        sys >= 140 ? "Stage 1 Hypertension" : "Normal";

                response = "{\"classification\":\"" + classification + "\",\"systolic\":" + sys +
                        ",\"diastolic\":" + dia + ",\"history\":" + patient.bpHistory +
                        ",\"soapNotes\":\"BP: " + sys + "/" + dia + "\\nAssessment: " + classification + "\"}";
            }
            else {
                response = "{\"error\":\"Not found\"}";
                statusCode = 404;
            }

            exchange.sendResponseHeaders(statusCode, response.getBytes().length);
            exchange.getResponseBody().write(response.getBytes());
            exchange.getResponseBody().close();
        });

        server.setExecutor(null);
        server.start();
        System.out.println("Server running on http://localhost:8080");
        System.out.println("Try: http://localhost:8080/api/patients");
    }

    static String readBody(HttpExchange ex) throws IOException {
        InputStreamReader isr = new InputStreamReader(ex.getRequestBody(), "UTF-8");
        BufferedReader br = new BufferedReader(isr);
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        br.close();
        return sb.toString();
    }
}