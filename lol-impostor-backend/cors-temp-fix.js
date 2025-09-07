// CORS Temporary Fix for Emergency
// Replace in server.ts if needed

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins temporarily
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: "*", // Allow all origins temporarily  
  credentials: true
}));