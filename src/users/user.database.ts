import { User, UnitUser, Users} from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import mysql from "mysql";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "intprog_db"
});

const FIND_BY_ID = "SELECT * FROM users WHERE id = ?";
const INSERT_NEW_USER = "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)";
const FIND_BY_EMAIL = "SELECT * FROM users WHERE email = ?";
const FIND_ALL_BY_USERNAME = "SELECT * FROM users WHERE username LIKE ?";
const FIND_ALL_BY_EMAIL = "SELECT * FROM users WHERE email LIKE ?";
const FIND_ALL_USERS = "SELECT * FROM users";
const UPDATE_USER_BY_ID = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
const DELETE_USER_BY_ID = "DELETE FROM users WHERE id = ?";
const FIND_BY_USERNAME_AND_EMAIL = "SELECT * FROM users WHERE username LIKE ? AND email LIKE ?";

export const findById = async (id: string): Promise<UnitUser | null> => {
    return new Promise((resolve, reject) => {
        db.query(FIND_BY_ID, [id], (err, res) => {
            if (err) {
                return resolve(null);
            }
            return resolve(res && res.length > 0 ? res[0] : null);
        });
    });
}

export const createUser = async (userData: UnitUser): Promise<UnitUser | null> => {

    return new Promise(async (resolve, reject) => {
        const id = random();
        const { username, email, password } = userData;

        try {
        
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            userData.id = id;

            db.query(INSERT_NEW_USER, [id, username, email, hashedPassword]);

            resolve(userData);
        } catch (error) {
            reject(error);
        }
    });
};

export const findByEmail = async (user_email: string): Promise<UnitUser | null> => {
    return new Promise((resolve, reject) => {
        db.query(FIND_BY_EMAIL, [user_email], (err, res) => {
            if (err) {
                return resolve(null);
            }
            return resolve(res && res.length > 0 ? res[0] : null);
        });
    });
}

export const compassPassword = async(email : string, supplied_password : string): Promise<null | UnitUser> => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await findByEmail(email);
            
            if (!user) {
                return resolve(null);
            }

            const decryptPassword = await bcrypt.compare(supplied_password, user.password);

            if (!decryptPassword) {
                return resolve(null);
            }

            return resolve(user);
        } catch (error) {
            console.error("Error in compassPassword:", error);
            return reject(error);
        }
    });
}

export const findByEmailAndUsername = async (user_email: string, username: string): Promise<UnitUser[] | null> => {

    return new Promise(async(resolve, reject) => {
        const emailPattern = `%${user_email}%`;
        const usernamePattern = `%${username}%`;
        db.query(FIND_BY_USERNAME_AND_EMAIL, [usernamePattern, emailPattern], (err, res) => {
            if(err){
                reject([])
            }else{
                resolve(res)
            }
        });
    })
}

export const findAllByEmail = async (user_email: string): Promise<UnitUser[] | null> => {
    return new Promise((resolve, reject) => {
        const emailPattern = `%${user_email}%`;
        db.query(FIND_ALL_BY_EMAIL, [emailPattern], (err, res) => {
            console.log(res);
            if (err) {
                
                return resolve(null);
            }
            return resolve(res && res.length > 0 ? res : null);
        });
    });
}

export const findAllByUsername = async (username: string): Promise<UnitUser | null> => {
    return new Promise((resolve, reject) => {
        const usernamePattern = `%${username}%`;
        db.query(FIND_ALL_BY_USERNAME, [usernamePattern], (err, res) => {
            if (err) {
                return resolve(null);
            }
            return resolve(res && res.length > 0 ? res : null);
        });
    });
}

export const findAll = async() : Promise<UnitUser[]> =>{
    return new Promise((resolve, reject) => {
        db.query(FIND_ALL_USERS, (err, res) => {
            if(err){
                reject([])
            }else{
                resolve(res);
            }
        })
    });
}

export const update = async(id: string, updateValues: User): Promise<UnitUser | null> => {
    return new Promise(async (resolve, reject) => {

        if(updateValues.password){
            const salt = await bcrypt.genSalt(10)
            const newPass = await bcrypt.hash(updateValues.password, salt)

            updateValues.password = newPass
        }

        db.query(UPDATE_USER_BY_ID, [updateValues.username, updateValues.email, updateValues.password, id]);

        let user : UnitUser = {
            id : id,
            ...updateValues
        }

        resolve(user);
    })    
}

export const remove = async(id: string): Promise<null | void> => {

    db.query(DELETE_USER_BY_ID, [id]);

}
