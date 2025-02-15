import { View, as_view } from "./views.js";
import app from "../main.js";
import partial from "./preset.js";


function path(route, ViewClass, options = {}) {
    const viewInstance = ViewClass.as_view(options); // Önce viewInstance oluştur
    app.get(route, viewInstance);
    app.post(route, viewInstance);

    return {
        route,
        view: ViewClass.as_view(),
        methods: ["GET", "POST"]
    }
}


function include(urlpatterns) {
    return urlpatterns.map(({ route, view, methods }) => ({
        route,
        view,
        methods
    }));
}



export { path, include}