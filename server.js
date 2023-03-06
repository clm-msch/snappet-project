import { app } from "app.js";
const port = 3002;


// lancement du serveur
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});