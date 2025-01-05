export default defineEventHandler((event) => {
  setHeader(event, "Access-Control-Allow-Origin", "https://www.dhafir-ayad.com/");
  setHeader(
    event,
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  setHeader(
    event,
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
});
