from pydantic import BaseModel
from main import DatabaseManager
from auth import AuthDatabaseManager

from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query


app = FastAPI()

db = DatabaseManager()
auth = AuthDatabaseManager()

from fastapi.middleware.cors import CORSMiddleware
origins = [
    "http://localhost:5173",  # React/Vite default port
    "http://127.0.0.1:5173",
]

# IMPORTANT: Enable CORS so your React app (port 5173) can talk to Python (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginSchema(BaseModel):
    username: str
    password: str

class GymPayload(BaseModel):
    gym_name: str
    location: str
    contact_number: str

    class Config:
        extra = "ignore"

class adminCreate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    name: str
    email: str
    phone: str
    gym_id: int

class AdminUpdatePayload(BaseModel):
    name: str
    email: str
    phone: str


@app.post("/api/auth/login")
def login(credentials: LoginSchema):
    # Use the login_user method from AuthDatabaseManager
    result = auth.login_user(credentials.username, credentials.password)

    if result["status"] == "error":
        raise HTTPException(status_code=401, detail=result["message"])

    # FastAPI automatically handles dict -> JSON conversion
    return result["data"]






# Model for individual exercises within a session
class ExerciseSchema(BaseModel):
    id: int
    name: str
    sets: List[dict]  # Or a more specific model for sets

# Model for a full workout session
class WorkoutSession(BaseModel):
    id: int
    name: str
    date: datetime
    duration: int  # in seconds
    volume: float  # Ensure this is a float/int, not None
    exercises: List[ExerciseSchema]

# Model for the dashboard summary
class DashboardSummary(BaseModel):
    count: int
    volume: float
    time: str
    records: int
# ==========================
# REQUEST MODELS
# ==========================

class GymCreate(BaseModel):
    name: str
    location: str
    contact: str



class MemberCreate(BaseModel):
    username: str
    password: str
    name: str
    dob: str
    gender: str
    email: str
    phone: str
    gym_id: int

class TrainerCreate(BaseModel):
    username: str
    password: str
    name: str
    specialization: str
    phone: str
    schedule: str
    gym_id: int

class PlanCreate(BaseModel):
    plan_name: str
    duration: int
    price: float
    access_level: str
    user_id: int
# ==========================
# GYM APIs
# ==========================

@app.post("/gyms")
def add_gym(gym: GymPayload):
    result = db.insert_gym(gym.gym_name, gym.location, gym.contact_number)
    return result

@app.get("/gyms")
def get_gyms():
    stats = db.get_dev_dashboard_stats()
    return stats.get("gyms_overview", [])


@app.get("/metrics/{user_id}")
def get_dashboard_metrics(user_id):
    result = db.get_admin_dashboard(user_id)
    return result

@app.put("/gyms/{gym_id}")
def update_gym(gym_id: int, gym: GymPayload):
    result = db.update_gym(gym_id, gym.gym_name, gym.location, gym.contact_number)
    return result


@app.delete("/gyms/{gym_id}")
def delete_gym(gym_id: int):
    result = db.delete_gym(gym_id)
    return result

@app.get("/dev/stats")
def get_dev_stats():
    """
    Endpoint to provide aggregated data for the developer dashboard.
    """
    stats = db.get_dev_dashboard_stats()
    if stats.get("status") == "error":
        raise HTTPException(status_code=500, detail=stats["message"])
    return stats

@app.put("/admins/{admin_id}")
def update_gym_admin(admin_id: int, admin: AdminUpdatePayload):

    result = db.update_gym_admin(admin_id, admin.name, admin.email, admin.phone)
    return result

@app.delete("/admins/{admin_id}")
def delete_admin(admin_id: int):
    result = db.delete_admin(admin_id)
    return result



@app.post("/admins")
def add_gym_admin(admin: adminCreate):
   

    # 1. Handle username
    username = admin.username
    if not username:
        username = admin.email.split('@')[0]

    # 2. Handle password
    password = "123"

    # 3. Insert user into auth system
    res = auth.insert_user(username, "gym_admin", password)
    if res.get("status") == "error":
        # Handle case where username might already exist
        raise HTTPException(status_code=409, detail=res.get("message"))

    # 4. Get the new user_id
    user_res = auth.get_user_by_username(username)
    user_id = user_res["user_id"]

    # 5. Insert into gym_admin table
    result = db.insert_gym_admin(
        admin.name,
        admin.email,
        admin.phone,
        admin.gym_id,
        user_id
    )
    return {**result, "generated_username": username, "generated_password": password}

@app.get("/admins")
def get_admins():
    return db.get_all_admins()



@app.get("/history/{session_id}/{user_id}")
def get_history_detail(session_id: int, user_id: int):
    result = db.get_history_detail(session_id, user_id)
    return result


@app.post("/addplan")
def add_gym_plan(plan: dict):
    user_id = plan["user_id"]
    gym_id = db.get_gym_id_member(user_id)["gym_id"]
    result = db.insert_plan(
        plan["plan_name"],
        plan["duration"],
        plan["price"],
        plan["access_level"],
        gym_id
    )
    return result

@app.put("/plan/{plan_id}")
def update_gym_plan(plan_id: int, plan:dict):
    result = db.update_plan(
        plan_id,
        plan["user_id"],
        plan["plan_name"],
        plan["duration"],
        plan["price"],
        plan["access"]
    )
    return result

@app.delete("/gymplan/{plan_id}")
def delete_gym_plan(plan_id: int):
    result = db.delete_plan(plan_id)
    return result

@app.get("/trainers/{user_id}")
def get_trainers(user_id):
    result = db.get_trainers(user_id)
    return result

@app.post("/addtrainer")
def add_trainer(trainer: dict):
    result = auth.insert_user(trainer["name"], "trainer", "123")
    res = auth.get_user_by_username(trainer["name"])
    user_id = res["user_id"]
    gym_id = db.get_gym_id_member(trainer["user_id"])["gym_id"]


    result = db.insert_trainer(
        trainer["name"],
        trainer["specialization"],
        trainer["phone"],
        trainer["schedule"],
        gym_id
        ,user_id
    )
    return result

@app.delete("/trainer/{trainer_id}")
def delete_trainer(trainer_id):
    result = db.delete_trainer(trainer_id)
    user_id = result.get("user_id")
    res  = auth.delete_user(user_id)
    return result


@app.post("/membership/{user_id}")
def add_membership(user_id: int, plan_id: int, start_date: str, expiry_date: str, status: str):
    res = db.get_member_id(user_id)
    member_id = res["member_id"]
    result = db.insert_membership(member_id, plan_id, start_date, expiry_date, status)
    return result
# MEMBER APIs
# ==========================
@app.post("/workouts")
def save_workout(workout: dict):
    result = db.save_workout(workout,user_id=workout["user_id"])
    return result

@app.get("/membership/{user_id}")
def get_active_membership(user_id: int):
    result = db.get_status(user_id)
    return result

@app.get("/plans/{user_id}")
def get_plans(user_id):
    result = db.get_plans(user_id)
    return result

@app.get("/getmembers/{user_id}")
def get_members(user_id):
    result = db.get_members(user_id)
    return result


@app.post("/changemembership")
def upgrade_membership(payload: dict):
    print("Received upgrade request:", payload)
    return db.upgrade_membership(
        payload["user_id"],
        payload["plan_id"]
    )

@app.delete("/member/{member_id}")
def delete_member(member_id):
    # First, delete the user from the auth database
    # Then, delete the member from the main database
    result = db.delete_member_cascade(member_id)
    user_id = result.get("user_id")
    res  = auth.delete_user(user_id)
    if result["status"] == "error" or res["status"] == "error":
        raise HTTPException(status_code=400, detail="Error deleting member")

    return result

@app.post("/addmember")
def add_member(member:dict):
    result = auth.insert_user(member["name"], "member", member["password"])
    res = auth.get_user_by_username(member["name"])
    user_id = res["user_id"]
    gym_id = db.get_gym_id_member(member["user_id"])["gym_id"]

    result = db.insert_member(
        member["name"],
        member["date_of_birth"],
        member["gender"],
        member["email"],
        member["phone"],
        gym_id,
        user_id
    )
    return result

@app.post("/trainer")
def add_trainer(trainer: TrainerCreate):
    result = auth.insert_user(trainer.username, "trainer", trainer.password)
    res = auth.get_user_by_username(trainer.username)
    user_id = res["user_id"]

    result = db.insert_trainer(
        trainer.name,
        trainer.specialization,
        trainer.phone,
        trainer.schedule,
        trainer.gym_id
        ,user_id
    )
    return result

# Model for a full workout session
class WorkoutSession(BaseModel):
    id: int
    name: str
    date: datetime
    duration: int  # in seconds
    volume: float  # Ensure this is a float/int, not None
    exercises: List[ExerciseSchema]

# Model for the dashboard summary
class DashboardSummary(BaseModel):
    count: int
    volume: float
    time: str
    records: int

@app.get("/history", response_model=List[WorkoutSession])
def get_history(user_id : int):
    # 1. Fetch from MySQL: SELECT * FROM workout_session ORDER BY date DESC
    # 2. Map rows to the WorkoutSession model
    # Dummy example of what the return should look like:
    return db.get_history(user_id)

@app.get("/summary", response_model=DashboardSummary)
def get_summary(user_id: int):
    # Perform your aggregation queries here (SUM(volume), COUNT(*), etc.)
    return db.get_summary(user_id)