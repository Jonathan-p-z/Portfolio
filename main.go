package main

import (
    "log"
    "net/http"
    "portfolio/internal/handlers"
)

func main() {
    // Fichiers statiques
    fs := http.FileServer(http.Dir("./assets"))
    http.Handle("/assets/", http.StripPrefix("/assets/", fs))

    // Routes
    http.HandleFunc("/", handlers.Index)
    http.HandleFunc("/about", handlers.About)
    http.HandleFunc("/projects", handlers.Projects)

    log.Println("Serveur démarré sur http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
