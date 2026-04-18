from http.client import HTTPException

from flask import app
import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta


class DatabaseManager:
    def __init__(self):
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'harsh@102',
            'database': 'repbase'
        }

    def _get_connection(self):
        try:
            return mysql.connector.connect(**self.db_config)
        except Error as e:
            print(f"Connection Error: {e}")
            return None

    def _execute_write(self, query, params=(), return_id=False):
        """Helper to cleanly execute all INSERT, UPDATE, and DELETE commands."""
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
    # 1. GYM MANAGEMENT
    # ==========================================
    def insert_gym(self, name, location, contact):
        query = "INSERT INTO gym (gym_name, location, contact_number) VALUES (%s, %s, %s)"
        return self._execute_write(query, (name, location, contact), return_id=True)

    def update_gym(self, gym_id, name, location, contact):
        query = "UPDATE gym SET gym_name=%s, location=%s, contact_number=%s WHERE gym_id=%s"
        return self._execute_write(query, (name, location, contact, gym_id))

    def delete_gym(self, gym_id):
        query = "DELETE FROM gym WHERE gym_id=%s"
        return self._execute_write(query, (gym_id,))
    

    def insert_gym_admin(self, name, email, phone, gym_id, user_id):

        query = """
        INSERT INTO gym_admin (name, email, phone, gym_id, user_id)
        VALUES (%s, %s, %s, %s, %s)
        """

        return self._execute_write(
            query,
            (name, email, phone, gym_id, user_id),
            return_id=True
        )
    def update_gym_admin(self, admin_id, name, email, phone):

        query = """
        UPDATE gym_admin
        SET name=%s, email=%s, phone=%s
        WHERE user_id=%s
        """

        return self._execute_write(
            query,
            (name, email, phone, admin_id)
        )
    # ==========================================
    # 2. MEMBERS & MEMBERSHIPS
    # ==========================================
    def insert_member(self, name, dob, gender, email, phone, gym_id, user_id):
        query = """INSERT INTO member (name, date_of_birth, gender, email, phone, gym_id ,user_id) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        return self._execute_write(query, (name, dob, gender, email, phone, gym_id, user_id), return_id=True)

    def update_member(self, member_id, name, email, phone):
        query = "UPDATE member SET name=%s, email=%s, phone=%s WHERE member_id=%s"
        return self._execute_write(query, (name, email, phone, member_id))

    def get_admin_dashboard(self, user_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # 1️⃣ Get gym_id from gym_admin
            cursor.execute("""
                SELECT gym_id FROM gym_admin
                WHERE user_id = %s
            """, (user_id,))
            
            res = cursor.fetchone()
            if not res:
                raise HTTPException(status_code=404, detail="Admin not found")

            gym_id = res["gym_id"]

            # 2️⃣ Gym details
            cursor.execute("""
                SELECT gym_name, location
                FROM gym
                WHERE gym_id = %s
            """, (gym_id,))
            
            gym = cursor.fetchone()

            # 3️⃣ Total members
            cursor.execute("""
                SELECT COUNT(*) AS totalMembers
                FROM member
                WHERE gym_id = %s
            """, (gym_id,))
            
            total_members = cursor.fetchone()["totalMembers"]

            # 4️⃣ Active / expired
            cursor.execute("""
                SELECT 
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS activeCount
                FROM membership m
                JOIN member mem ON m.member_id = mem.member_id
                WHERE mem.gym_id = %s
            """, (gym_id,))
            
            membership_stats = cursor.fetchone()

            # 5️⃣ Trainers count
            cursor.execute("""
                SELECT COUNT(*) AS trainersCount
                FROM trainer
                WHERE gym_id = %s
            """, (gym_id,))
            
            trainers = cursor.fetchone()["trainersCount"]

            return {
                "gymName": gym["gym_name"],
                "gymLocation": gym["location"],
                "totalMembers": total_members,
                "activeCount": membership_stats["activeCount"] or 0,
                "expiredCount": total_members - membership_stats["activeCount"] or 0,
                "trainersCount": trainers
            }

        finally:
            cursor.close()
            conn.close()

    def add_member(self, data: dict):
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            # 1️⃣ get gym_id from user_id
            cursor.execute("""
                SELECT gym_id FROM gym_admin WHERE user_id = %s
            """, (data["user_id"],))
            
            res = cursor.fetchone()
            if not res:
                raise HTTPException(status_code=404, detail="Admin not found")

            gym_id = res[0]

            # 2️⃣ insert member
            cursor.execute("""
                INSERT INTO member 
                (name, email, phone, date_of_birth, gender, gym_id ,user_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                data["name"],
                data["email"],
                data["phone"],
                data["date_of_birth"],
                data["gender"],
                gym_id,
                data["user_id"]
            ))

            # member_id = cursor.lastrowid

            # # 3️⃣ default membership
            # cursor.execute("""
            #     INSERT INTO membership (member_id, plan_id, start_date, expiry_date, status)
            #     VALUES (%s, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Active')
            # """, (member_id,))

            # conn.commit()

            return {"message": "Member added"}

        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))

        finally:
            cursor.close()
            conn.close()

    def get_members(self, user_id):
            conn = self._get_connection()
            cursor = conn.cursor(dictionary=True)

            try:
                # 1️⃣ Get gym_id
                cursor.execute("""
                    SELECT gym_id FROM gym_admin WHERE user_id = %s
                """, (user_id,))
                
                res = cursor.fetchone()
                if not res:
                    raise HTTPException(status_code=404, detail="Admin not found")

                gym_id = res["gym_id"]

                # 2️⃣ Get members with membership
                cursor.execute("""
                    SELECT 
                        m.member_id,
                        m.name,
                        m.email,
                        mp.plan_name,
                        ms.status,
                        ms.expiry_date
                    FROM member m
                    LEFT JOIN membership ms ON m.member_id = ms.member_id
                    LEFT JOIN membership_plan mp ON ms.plan_id = mp.plan_id
                    WHERE m.gym_id = %s
                    ORDER BY m.member_id DESC
                """, (gym_id,))

                members = cursor.fetchall()

                return members

            finally:
                cursor.close()
                conn.close()

    def save_workout(self ,workout: dict , user_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            conn.start_transaction()
            member_id = self.get_member_id(user_id).get("member_id")

            # ✅ Step 1: Insert workout session
            cursor.execute("""
                INSERT INTO workout_session (workout_date, duration, member_id, workout_title)
                VALUES (CURDATE(), %s, %s, %s)
            """, (workout['duration'], member_id, workout['name']))

            session_id = cursor.lastrowid

            # ✅ Step 2: Loop exercises
            for ex in workout['exercises']:

                # 🔥 A. Get previous PR for this exercise
                cursor.execute("""
                    SELECT MAX(weight) AS max_weight
                    FROM set_log
                    WHERE exercise_id = %s AND session_id != %s
                """, (ex['exercise_id'], session_id))

                res = cursor.fetchone()
                prev_best = res['max_weight'] if res and res['max_weight'] else 0.0

                # 🔥 B. Max in current session
                current_session_max = max([s["weight_kg"] for s in ex['sets']])

                # 🔥 C. Insert sets
                for i, s in enumerate(ex['sets']):

                    is_record = 1 if (
                        s["weight_kg"] > prev_best and s["weight_kg"] == current_session_max
                    ) else 0

                    cursor.execute("""
                        INSERT INTO set_log 
                        (session_id, set_no, exercise_id, reps, weight, record)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        session_id,
                        i + 1,
                        ex["exercise_id"],
                        s["reps"],
                        s["weight_kg"],
                        is_record
                    ))

            conn.commit()
            return {"status": "success"}

        except mysql.connector.Error as err:
            conn.rollback()
            # raise HTTPException(status_code=500, detail=str(err))

        finally:
            cursor.close()
            conn.close()
        
    def get_gym_id_member(self, user_id):
        conn = self._get_connection()

        try:
            cursor = conn.cursor(dictionary=True)

            # Check gym_admin
            cursor.execute("""
                SELECT gym_id FROM gym_admin WHERE user_id = %s
            """, (user_id,))
            result = cursor.fetchone()
            if result:
                return result   # ✅ returns { gym_id: ... }

            # Check member
            cursor.execute("""
                SELECT gym_id FROM member WHERE user_id = %s
            """, (user_id,))
            result = cursor.fetchone()
            if result:
                return result

            # Check trainer
            cursor.execute("""
                SELECT gym_id FROM trainer WHERE user_id = %s
            """, (user_id,))
            result = cursor.fetchone()
            if result:
                return result

            return None

        finally:
            cursor.close()
            conn.close()

    def get_member_id(self, user_id):

        conn = self._get_connection()

        try:
            cursor = conn.cursor(dictionary=True)

            query = """
            SELECT member_id
            FROM member
            WHERE user_id=%s
            """

            cursor.execute(query, (user_id,))

            result = cursor.fetchone()

            if result:
                return {"status": "success", "member_id": result["member_id"]}

            return {"status": "error", "message": "Member not found"}

        except Error as e:
            return {"status": "error", "message": str(e)}

        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def insert_plan(self, plan_name, duration, price , access_level , gym_id):
        query = "INSERT INTO membership_plan (plan_name, duration,  price , access_level , gym_id) VALUES (%s, %s, %s, %s, %s)"
        return self._execute_write(query, (plan_name, duration, price , access_level , gym_id), return_id=True)

    def update_plan(self, plan_id, gym_id ,  plan_name, duration, price , access_level):
        query = "UPDATE membership_plan SET plan_name=%s, duration=%s, price=%s, access_level=%s WHERE plan_id=%s"
        return self._execute_write(query, (plan_name, duration, price , access_level , plan_id))
    


    def delete_plan(self, plan_id):
        q = "DELETE FROM membership WHERE plan_id=%s"
        w = self._execute_write(q, (plan_id,))


        query = "DELETE FROM membership_plan WHERE plan_id=%s"

        return self._execute_write(query, (plan_id,))
    


    def get_status(self, user_id):
        conn = self._get_connection()
        # Using dictionary=True makes it easy to map to your React component
        cursor = conn.cursor(dictionary=True)

        member_id = self.get_member_id(user_id).get("member_id")
        gym_id = self.get_gym_id_member(user_id).get("gym_id")
        
        # We JOIN the membership table with a plans table to get the name and access level
        query = """
            SELECT 
                m.status, 
                m.expiry_date, 
                p.plan_name, 
                p.access_level
            FROM membership m
            JOIN membership_plan p ON m.plan_id = p.plan_id
            WHERE m.member_id = %s
            ORDER BY m.expiry_date DESC 
            LIMIT 1
        """
        
        cursor.execute(query, (member_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()

        query = """
        SELECT g.gym_name AS gym_branch
        FROM gym g
        where g.gym_id = %s
        """
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, (gym_id,))
        gym_result = cursor.fetchone()
        cursor.close()
        conn.close()


        if not result:
            # raise HTTPException(status_code=404, detail="Membership not found")
            return {}

        # Calculate Days Left
        # Since today is March 17, 2026, and your data expires March 30:
        today = datetime.now().date()
        expiry = result['expiry_date'] # This is '2026-03-30'
        days_left = (expiry - today).days

        return {
            "plan_name": result['plan_name'],
            "is_active": result['status'] == 'Active' and days_left > 0,
            "expiry_date": expiry.strftime("%b %d, %Y"),
            "gym_branch": gym_result["gym_branch"] ,
            "access_level": result['access_level'],
            "days_remaining": max(0, days_left)
        }
    def get_plans( self, user_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # We fetch all available plans from the plans table
        # You can use the user_id here if you want to offer 
        # specific discounts to certain users in the future.
        gymid = self.get_gym_id_member(user_id).get("gym_id")
        query = "SELECT plan_id, plan_name as name, duration, price, access_level as access FROM membership_plan WHERE gym_id = %s"
        
        cursor.execute(query, (gymid,))
        all_plans = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Ensure 'popular' is converted to a boolean (True/False) for React
        for plan in all_plans:
            plan['popular'] = False
            
        return all_plans
    


    def upgrade_membership(self, user_id, plan_id):

        conn = self._get_connection()
        try:
            print("Upgrading membership for user_id:", user_id, "to plan_id:", plan_id)
            cursor = conn.cursor(dictionary=True)
            conn.start_transaction()

            # get member_id safely
            member_data = self.get_member_id(user_id)
            if not member_data:
                return {"status": "error", "message": "Member not found"}

            member_id = member_data["member_id"]

            print("Fetched member_id:", member_id)

            # get plan duration
            cursor.execute("""
                SELECT duration FROM membership_plan
                WHERE plan_id = %s
            """, (plan_id,))
            
            plan = cursor.fetchone()
            if not plan:
                return {"status": "error", "message": "Plan not found"}

            duration = plan["duration"]

            # compute dates
            start_date = datetime.today().date()
            end_date = start_date + timedelta(days=duration)

            print("Calculated start_date:", start_date, "end_date:", end_date)
            cursor.execute("""
                    UPDATE membership 
                    SET plan_id = %s, 
                        start_date = %s, 
                        expiry_date = %s, 
                        status = 'Active'
                    WHERE member_id = %s
                """, (plan_id, start_date, end_date, member_id))
            
            print("Membership updated, rows affected:", cursor.rowcount)

            # insert new membership
            if cursor.rowcount == 0:
                cursor.execute("""
                    INSERT INTO membership (member_id, plan_id, start_date, expiry_date, status)
                    VALUES (%s, %s, %s, %s, 'Active')
                """, (member_id, plan_id, start_date, end_date))

            conn.commit()
            print("Transaction committed successfully")
            return {
                "status": "success",
                "start_date": str(start_date),
                "end_date": str(end_date)
            }

        except Exception as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}

        finally:
            cursor.close()
            conn.close()
    

    def insert_membership(self, member_id, plan_id, start_date, expiry_date, status):

        conn = self._get_connection()

        try:
            cursor = conn.cursor(dictionary=True)

            # Check if membership already exists
            check_query = """
            SELECT status FROM membership WHERE member_id=%s
            """
            cursor.execute(check_query, (member_id,))
            result = cursor.fetchone()

            # If no previous membership → INSERT
            if not result:
                query = """
                INSERT INTO membership (member_id, plan_id, start_date, expiry_date, status)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (member_id, plan_id, start_date, expiry_date, status))

            else:
                previous_status = result["status"]

                # If previous membership inactive → update start_date
                if previous_status == "Inactive":
                    query = """
                    UPDATE membership
                    SET plan_id=%s,
                        start_date=%s,
                        expiry_date=%s,
                        status=%s
                    WHERE member_id=%s
                    """
                    cursor.execute(query, (plan_id, start_date, expiry_date, status, member_id))

                # If active → do not change start_date
                else:
                    query = """
                    UPDATE membership
                    SET plan_id=%s,
                        expiry_date=%s,
                        status=%s
                    WHERE member_id=%s
                    """
                    cursor.execute(query, (plan_id, expiry_date, status, member_id))

            conn.commit()

            return {"status": "success"}

        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}

        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def insert_trainer(self, name, specialization, phone, schedule, gym_id, user_id):
        query = """INSERT INTO trainer (name, specialization, phone, schedule, gym_id ,user_id) 
                   VALUES (%s, %s, %s, %s, %s, %s)"""
        return self._execute_write(query, (name, specialization, phone, schedule, gym_id, user_id), return_id=True)
    
    def get_trainers(self, user_id):
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # 1️⃣ Get gym_id
            cursor.execute("""
                SELECT gym_id FROM gym_admin WHERE user_id = %s
            """, (user_id,))
            
            res = cursor.fetchone()
            if not res:
                raise HTTPException(status_code=404, detail="Admin not found")

            gym_id = res["gym_id"]

            # 2️⃣ Get trainers
            cursor.execute("""
                SELECT 
                    trainer_id,
                    name,
                    specialization,
                    phone,
                    schedule
                FROM trainer
                WHERE gym_id = %s
                ORDER BY trainer_id DESC
            """, (gym_id,))

            trainers = cursor.fetchall()

            return trainers

        finally:
            cursor.close()
            conn.close()
    
    def update_trainer(self, trainer_id, name, specialization, phone, schedule):
        query = "UPDATE trainer SET name=%s, specialization=%s, phone=%s, schedule=%s WHERE trainer_id=%s"
        return self._execute_write(query, (name, specialization, phone, schedule, trainer_id))
    
    def delete_trainer(self, trainer_id):
        conn = self._get_connection()

        try:
            cursor = conn.cursor(prepared=True)
            conn.start_transaction()
            cursor.execute("SELECT user_id FROM trainer WHERE trainer_id=%s", (trainer_id,))
            result = cursor.fetchone()

            user_id = result[0] if result else None

            cursor.execute("DELETE FROM trainer WHERE trainer_id=%s", (trainer_id,))
            conn.commit()
            return {"status": "success", "message": "Trainer deleted." , "user_id": user_id}
        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

        
    
    
    def update_membership_status(self, member_id, status):
        query = "UPDATE membership SET status=%s WHERE member_id=%s"
        return self._execute_write(query, (status, member_id))

    def delete_member_cascade(self, member_id):
        """
        Task 6 (Transactions): Deleting a member requires deleting their child records first 
        to avoid Foreign Key constraint errors.
        """
        conn = self._get_connection()

        try:
            cursor = conn.cursor(prepared=True)
            conn.start_transaction()
            cursor.execute("SELECT user_id FROM member WHERE member_id=%s", (member_id,))
            result = cursor.fetchone()

            user_id = result[0] if result else None
            # Delete in order of dependencies
            cursor.execute("DELETE FROM payment WHERE member_id=%s", (member_id,))
            cursor.execute("DELETE FROM membership WHERE member_id=%s", (member_id,))
            
            # Sub-query to delete set_log for all sessions owned by this member
            cursor.execute("""DELETE FROM set_log WHERE session_id IN 
                              (SELECT session_id FROM workout_session WHERE member_id=%s)""", (member_id,))
            cursor.execute("DELETE FROM workout_session WHERE member_id=%s", (member_id,))
            cursor.execute("DELETE FROM member WHERE member_id=%s", (member_id,))
            
            conn.commit()
            return {"status": "success", "message": "Member and all associated data deleted." , "user_id": user_id}
        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    # ==========================================
    # 3. WORKOUTS (THE HEVY CLONE LOGIC)
    # ==========================================
    def insert_workout_session(self, workout_date, duration, member_id):
        # Will trigger your 'check_membership_before_workout' logic automatically
        query = "INSERT INTO workout_session (workout_date, duration, member_id) VALUES (%s, %s, %s)"
        return self._execute_write(query, (workout_date, duration, member_id), return_id=True)

    def update_workout_duration(self, session_id, duration):
        query = "UPDATE workout_session SET duration=%s WHERE session_id=%s"
        return self._execute_write(query, (duration, session_id))

    def insert_set_log(self, session_id, set_no, exercise_id, reps, weight):
        # PK is composite: session_id + set_no
        query = """INSERT INTO set_log (session_id, set_no, exercise_id, reps, weight) 
                   VALUES (%s, %s, %s, %s, %s)"""
        return self._execute_write(query, (session_id, set_no, exercise_id, reps, weight))

    def update_set_log(self, session_id, set_no, reps, weight):
        query = "UPDATE set_log SET reps=%s, weight=%s WHERE session_id=%s AND set_no=%s"
        return self._execute_write(query, (reps, weight, session_id, set_no))

    def delete_workout_cascade(self, session_id):
        """Atomic deletion for a workout and its sets."""
        conn = self._get_connection()
        try:
            cursor = conn.cursor(prepared=True)
            conn.start_transaction()
            cursor.execute("DELETE FROM set_log WHERE session_id=%s", (session_id,))
            cursor.execute("DELETE FROM workout_session WHERE session_id=%s", (session_id,))
            conn.commit()
            return {"status": "success", "message": "Workout deleted."}
        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    # ==========================================
    # 4. EXERCISE DICTIONARY 
    # ==========================================
    def insert_exercise(self, exercise_id, name, equipment, ex_type):
        # We assume you manually assign exercise_id to map cleanly to your static muscle data
        query = "INSERT INTO exercise (exercise_id, exercise_name, equipment, exercise_type) VALUES (%s, %s, %s, %s)"
        return self._execute_write(query, (exercise_id, name, equipment, ex_type))

    def update_exercise(self, exercise_id, name, equipment):
        query = "UPDATE exercise SET exercise_name=%s, equipment=%s WHERE exercise_id=%s"
        return self._execute_write(query, (name, equipment, exercise_id))

    def delete_exercise(self, exercise_id):
        # Note: Must delete from exercise_muscle first due to FK
        conn = self._get_connection()
        try:
            cursor = conn.cursor(prepared=True)
            conn.start_transaction()
            cursor.execute("DELETE FROM exercise_muscle WHERE exercise_id=%s", (exercise_id,))
            cursor.execute("DELETE FROM exercise WHERE exercise_id=%s", (exercise_id,))
            conn.commit()
            return {"status": "success", "message": "Exercise deleted."}
        except Error as e:
            conn.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def get_history(self, user_id):

        conn = self._get_connection()

        try:
            cursor = conn.cursor(dictionary=True)

            # Get member_id
            cursor.execute(
                "SELECT member_id FROM member WHERE user_id=%s",
                (user_id,)
            )
            member = cursor.fetchone()

            if not member:
                return []

            member_id = member["member_id"]

            # Get workout sessions
            cursor.execute(
                """
                SELECT session_id,workout_title , workout_date, duration
                FROM workout_session
                WHERE member_id=%s
                ORDER BY workout_date DESC
                """,
                (member_id,)
            )

            sessions = cursor.fetchall()
            result = []

            for s in sessions:

                # fetch exercises inside session
                cursor.execute(
                    """
                    SELECT 
                        sl.exercise_id,
                        e.exercise_name,
                        sl.reps,
                        sl.weight
                    FROM set_log sl
                    JOIN exercise e
                    ON sl.exercise_id = e.exercise_id
                    WHERE sl.session_id=%s
                    """,
                    (s["session_id"],)
                )

                sets = cursor.fetchall()

                exercises = {}
                volume = 0

                for row in sets:

                    ex_id = row["exercise_id"]

                    volume += (row["reps"] or 0) * (row["weight"] or 0)

                    if ex_id not in exercises:
                        exercises[ex_id] = {
                            "id": ex_id,
                            "name": row["exercise_name"],
                            "sets": []
                        }

                    exercises[ex_id]["sets"].append({
                        "reps": row["reps"],
                        "weight": row["weight"],
                    })

                result.append({
                    "id": s["session_id"],
                    "name": s["workout_title"],
                    "date": s["workout_date"],
                    "duration": s["duration"],
                    "volume": volume,
                    "exercises": list(exercises.values())
                })

            return result

        finally:
            cursor.close()
            conn.close()


# ===============================
# DASHBOARD SUMMARY
# ===============================
    def get_history_detail(self, session_id, user_id):
        result = self.get_history(user_id)
        for session in result:
            if str(session["id"]) == str(session_id):
                return session

    def get_summary(self ,user_id):

        conn = self._get_connection()

        try:
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                "SELECT member_id FROM member WHERE user_id=%s",
                (user_id,)
            )

            member = cursor.fetchone()

            if not member:
                return {
                    "count": 0,
                    "volume": 0,
                    "time": "0h 0min",
                    "records": 0
                }

            member_id = member["member_id"]

            # total sessions
            cursor.execute(
                "SELECT COUNT(*) AS count, SUM(duration) AS total_time FROM workout_session WHERE member_id=%s",
                (member_id,)
            )

            session_data = cursor.fetchone()

            # volume calculation
            cursor.execute(
                """
                SELECT SUM(reps * weight) AS volume
                FROM set_log sl
                JOIN workout_session ws
                ON ws.session_id = sl.session_id
                WHERE ws.member_id=%s
                """,
                (member_id,)
            )

            volume_data = cursor.fetchone()

            total_seconds = session_data["total_time"] or 0
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            cursor.execute(
                    """
                    SELECT COUNT(*) AS records
                    FROM set_log sl
                    JOIN workout_session ws
                    ON ws.session_id = sl.session_id
                    WHERE ws.member_id=%s
                    AND sl.record = 1
                    """,
                    (member_id,)
                )

            record_data = cursor.fetchone()


            return {
                "count": session_data["count"],
                "volume": volume_data["volume"] or 0,
                "time": f"{hours}h {minutes}min",
                "records": record_data["records"] or 0
            }

        finally:
            cursor.close()
            conn.close()
    def get_all_admins(self):
        conn = self._get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT 
                    ga.user_id as admin_id,
                    ga.name,
                    ga.email,
                    ga.phone,
                    g.gym_name,
                    g.gym_id
                FROM gym_admin ga
                JOIN gym g ON ga.gym_id = g.gym_id
            """)
            admins = cursor.fetchall()
            return admins
        except Error as e:
            print(f"Get All Admins Error: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    def delete_admin(self, user_id):
        # First, delete from gym_admin
        result = self._execute_write("DELETE FROM gym_admin WHERE user_id=%s", (user_id,))
        if result.get("status") == "error":
            return result

        # Then, delete from users_auth in the other database
        try:
            auth_conn = mysql.connector.connect(
                host='localhost',
                user='root',
                password='harsh@102',
                database='authing'
            )
            auth_cursor = auth_conn.cursor()
            auth_cursor.execute("DELETE FROM users_auth WHERE user_id=%s", (user_id,))
            auth_conn.commit()
        except Error as e:
            # If this fails, we might have an orphaned user, but the primary record is gone.
            print(f"Auth DB Delete Error: {e}")
            return {"status": "warning", "message": "Admin deleted from RepBase, but failed to delete from Auth system."}
        finally:
            if 'auth_conn' in locals() and auth_conn.is_connected():
                auth_cursor.close()
                auth_conn.close()
        
        return {"status": "success", "message": "Admin deleted successfully."}

    def get_dev_dashboard_stats(self):
        conn = self._get_connection()
        try:
            cursor = conn.cursor(dictionary=True)

            # KPI Cards
            cursor.execute("SELECT COUNT(*) AS total_gyms FROM gym")
            total_gyms = cursor.fetchone()['total_gyms']

            cursor.execute("SELECT COUNT(*) AS total_members FROM member")
            total_members = cursor.fetchone()['total_members']

            cursor.execute("SELECT COUNT(*) AS total_trainers FROM trainer")
            total_trainers = cursor.fetchone()['total_trainers']

            cursor.execute("SELECT COUNT(*) AS total_admins FROM gym_admin")
            total_admins = cursor.fetchone()['total_admins']

            # Total Users (from all roles)
            # Note: This requires querying a different database 'authing'.
            # We will handle this carefully.
            try:
                auth_conn = mysql.connector.connect(
                    host='localhost',
                    user='root',
                    password='harsh@102',
                    database='authing'
                )
                auth_cursor = auth_conn.cursor(dictionary=True)
                auth_cursor.execute("SELECT role, COUNT(*) AS count FROM users_auth GROUP BY role")
                role_counts = auth_cursor.fetchall()
                total_users = sum(rc['count'] for rc in role_counts)
            except Error as e:
                print(f"Auth DB Connection Error: {e}")
                role_counts = []
                total_users = 0
            finally:
                if 'auth_conn' in locals() and auth_conn.is_connected():
                    auth_cursor.close()
                    auth_conn.close()
            
            # Gyms Overview Table
            cursor.execute("""
                SELECT 
                    g.gym_id,
                    g.gym_name,
                    g.location,
                    g.contact_number,
                    (SELECT COUNT(*) FROM member m WHERE m.gym_id = g.gym_id) AS member_count,
                    (SELECT COUNT(*) FROM trainer t WHERE t.gym_id = g.gym_id) AS trainer_count,
                    (SELECT COUNT(*) FROM gym_admin ga WHERE ga.gym_id = g.gym_id) AS admin_count
                FROM gym g
            """)
            gyms_overview = cursor.fetchall()

            # Revenue by Gym
            cursor.execute("""
                SELECT 
                    g.gym_name,
                    COALESCE(SUM(p.amount), 0) AS total_revenue
                FROM gym g
                LEFT JOIN member m ON g.gym_id = m.gym_id
                LEFT JOIN membership ms ON m.member_id = ms.member_id
                LEFT JOIN payment p ON ms.member_id = p.member_id
                GROUP BY g.gym_name
            """)
            revenue_by_gym = cursor.fetchall()
            
            return {
                "total_gyms": total_gyms,
                "total_members": total_members,
                "total_trainers": total_trainers,
                "total_admins": total_admins,
                "total_users": total_users,
                "role_counts": role_counts,
                "gyms_overview": gyms_overview,
                "revenue_by_gym": revenue_by_gym,
            }
        except Error as e:
            print(f"Dev Dashboard Stats Error: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

    


rep = DatabaseManager()

    # rep.insert_gym_admin("first" , "w@gmail.com" , "1234567890" , "1" , "1")
    # print(rep.insert_member("second", "1999-01-01", "Male", "q@gmail.com" , "9876543210", 1, 2))