import { View, as_view } from "../func/views.js";
import bcrypt from 'bcrypt'
import { serializeUser } from "../db/serializers.js";
import renderTemplate from "./index.js";

class CreateUserView extends View {
   async post(req, res) {
        const { username, email, password } = req.body;

        try {
          const hashedPassword = await bcrypt.hash(password, 10)
          await serializeUser.create({ username, email, password: hashedPassword })

          res.end("User created")
          renderTemplate('index.html')

        } catch (error) {
            alert(error)
            res.end("Some problems")
        }
    }
}

export default CreateUserView