import mysql.connector
from mysql.connector import Error


class AuthDatabaseManager:

    def __init__(self):
        self.db_config = {
            "host": "localhost",
            "user": "root",
            "password": "harsh@102",
            "database": "authing"
        }

    # ==========================================
    # CONNECTION
    # ==========================================

    def _get_connection(self):
        try:
            return mysql.connector.connect(**self.db_config)
        except Error as e:
            print(f"Connection Error: {e}")
            return None


    def _execute_write(self, query, params=(), return_id=False):
        conn = self._get_connection()

        if not conn:
            return {"status": "error", "message": "Connection failed"}

        try:
            cursor = conn.cursor(prepared=True)
            cursor.execute(query, params)
            conn.commit()

            if return_id:
                return {"status": "success", "id": cursor.lastrowid}

            return {"status": "success", "rows_affected": cursor.rowcount}

        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}

        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()


    # ==========================================
    # CREATE USER
    # ==========================================

    def insert_user(self, username, role, password_hash):

        query = """
        INSERT INTO users_auth (username, role, password_hash)
        VALUES (%s, %s, %s)
        """

        return self._execute_write(
            query,
            (username, role, password_hash),
            return_id=True
        )


    # ==========================================
    # LOGIN
    # ==========================================

    def login_user(self, username, password_hash):

        conn = self._get_connection()
        if not conn:
                    return {"status": "error", "message": "Database connection failed"}

        try:
            cursor = conn.cursor(dictionary=True)

            query = """
            SELECT user_id, username, role
            FROM users_auth
            WHERE username=%s AND password_hash=%s
            """

            cursor.execute(query, (username, password_hash))

            user = cursor.fetchone()

            if not user:
                return {"status": "error", "message": "Invalid credentials"}

            return {"status": "success", "data": user}

        except Error as e:
            return {"status": "error", "message": str(e)}

        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()


    # ==========================================
    # GET USER BY USERNAME
    # ==========================================

    def get_user_by_username(self, username):

        conn = self._get_connection()

        try:
            cursor = conn.cursor(dictionary=True)

            query = """
            SELECT user_id, username, role
            FROM users_auth
            WHERE username=%s
            """

            cursor.execute(query, (username,))
            return cursor.fetchone()

        except Error as e:
            print(e)
            return None

        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()


    # ==========================================
    # CHANGE PASSWORD
    # ==========================================

    def change_password(self, user_id, new_password_hash):

        conn = self._get_connection()
        if not conn:
            return {"status": "error", "message": "Database connection failed"}


        try:
            cursor = conn.cursor()

            query = """
            UPDATE users_auth
            SET
                password_hash = %s,
            WHERE user_id = %s
            """

            cursor.execute(query, (new_password_hash, user_id))
            conn.commit()

            return {"status": "success"}

        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}

        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()





    # ==========================================
    # DELETE USER
    # ==========================================

    def delete_user(self, userid):

        query = """
        DELETE FROM users_auth
        WHERE user_id=%s
        """

        return self._execute_write(query, (userid,))


auth  = AuthDatabaseManager()

