import { path } from "../func/conf.js";
import CreateUserView from "./views.js";

const urlpatterns_api = [
    path('user/register/', CreateUserView)
]

export default urlpatterns_api