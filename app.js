import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";

const app = new Hono();

// Root path to show feedback buttons
app.get("/", async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <body>
        How would you rate this experience?
        <form action="/feedbacks/1" method="post"><button>Poor</button></form>
        <form action="/feedbacks/2" method="post"><button>Fair</button></form>
        <form action="/feedbacks/3" method="post"><button>Good</button></form>
        <form action="/feedbacks/4" method="post"><button>Very good</button></form>
        <form action="/feedbacks/5" method="post"><button>Excellent</button></form>
      </body>
    </html>
  `);
});

// POST routes for submitting feedback
app.post("/feedbacks/:value{[1-5]}", async (c) => {
  const value = Number(c.req.param("value"));
  
  // Use Deno KV to store feedback
  const kv = await Deno.openKv();
  const key = ["feedback", String(value)];
  
  // Get current count and increment
  const result = await kv.get(key);
  const currentCount = result.value || 0;
  await kv.set(key, currentCount + 1);
  
  // Redirect to root after submission using POST/Redirect/GET
  return c.redirect("/");
});

// GET routes to retrieve feedback counts
app.get("/feedbacks/:value{[1-5]}", async (c) => {
  const value = c.req.param("value");
  
  const kv = await Deno.openKv();
  const result = await kv.get(["feedback", value]);
  const count = result.value || 0;
  
  return c.text(`Feedback ${value}: ${count}`);
});

export default app;