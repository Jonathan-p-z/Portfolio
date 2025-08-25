package handlers

import (
    "html/template"
    "net/http"
)

func renderTemplate(w http.ResponseWriter, tmpl string) {
    t, err := template.ParseFiles("templates/" + tmpl)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    t.Execute(w, nil)
}

func Index(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "index.html")
}

func About(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "about.html")
}

func Projects(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "projects.html")
}
