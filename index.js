import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 3000; // If process.env.PORT is undefined, then it defaults to 3000
const secretKey = "10";

app.use(express.json());
app.use(cors());


const pool = mysql.createPool({
    host: "147.50.231.19",
    user: "devsriwa_workshop_react",
    password: "*Nextsoft1234",
    database: "devsriwa_workshop_react",
  });

app.get("/", (req, res) => {
  res.status(200).json({ message: "hellow wold" });
});

// Users
app.post("/user", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (name && username && password) {
      const sqlCheck = `SELECT id, name, username FROM users WHERE username = ?`;
      const [resultCheck] = await pool.query(sqlCheck, [username]);
      if (resultCheck.length > 0) {
        throw new Error("มีผู้ใช้งานนี้แล้ว กรุณาสมัครใหม่");
      } else {
        const sql = `INSERT INTO users (name, username, password) VALUES (?, ?, ?)`;
        await pool.query(sql, [name, username, password]);
        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    } else {
      throw new Error("กรุณากรอกข้อมูลให้ครบ");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if ((username, password)) {
      const sqlCheck = `SELECT id, name,  username, password FROM users WHERE username = ? AND password = ?`;
      const [result] = await pool.query(sqlCheck, [username, password]);
      if (result.length > 0) {
        const token = jwt.sign(
          { user_id: result[0].id, name: result[0].name },
          secretKey,
          {
            expiresIn: "1d",
          }
        );
        res.status(200).json({ token });
      } else {
        throw new Error("ไม่พบผู้ใช้งาน");
      }
    } else {
      throw new Error("กรุณากรอกข้อมูลให้ครบ");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Products
app.post("/product", async (req, res) => {
  try {
    const { user_id, name, qty, price, image } = req.body;
    if (user_id) {
      const sqlCheck = `SELECT id FROM products WHERE name = ? AND user_id = ?`;
      const [resultCheck] = await pool.query(sqlCheck, [name, user_id]);
      if (resultCheck.length > 0) {
        throw new Error("คุณมีสินค้านี้ในสต๊อกแล้ว");
      } else {
        const sql = `INSERT  INTO products (name, qty, price, image, user_id) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(sql, [name, qty, price, image, user_id]);
        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    } else {
      throw new Error("ไม่พบผู้ใช้งาน");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

app.get("/product", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (user_id) {
      const sql = `SELECT id, name, qty, price FROM products WHERE user_id = ?`;
      const [result] = await pool.query(sql, [user_id]);
      res.status(200).json(result);
    } else {
      throw new Error("ไม่พบผู้ใช้งานนี้");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

app.put("/product/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, qty, price, id } = req.body;
    // console.log(req.body);

    if (user_id) {
      const sqlCheck = `SELECT id FROM products WHERE name = ? AND user_id = ? `;
      const [resultCheck] = await pool.query(sqlCheck, [name, user_id]);

      if (resultCheck.length > 0) {
        throw new Error("มีสินค้านี้ในสต๊อกแล้ว");
      } else {
        const sql = `UPDATE products SET name = ?, qty = ?, price = ? WHERE id = ?`;
        await pool.query(sql, [name || "", qty || "", price || "", id]);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      }
    } else {
      throw new Error("ไม่พบผู้ใช่งาน");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});
app.delete("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
        const sql = `DELETE FROM products WHERE id = ?`
        await pool.query(sql, [id])
        res.status(200).json({message:"ลบสำเร็จ"})
    } else {
      throw new Error("ไม่พบผู้ใช่งาน");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

app.listen(port, () => {
  console.log("server is ", port);
});
