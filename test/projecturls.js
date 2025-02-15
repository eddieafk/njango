import { path, include } from "../func/conf.js";
import { View } from "../func/views.js";
import urlpatterns_api from "./apiurls.js";

const urlpatterns = [
    { route: "api/", view: include(urlpatterns_api), methods: ["GET", "POST"]  }
]

export default urlpatterns