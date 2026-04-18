/* =====================================================
   TASK-4: SQL Queries
   Project: Gym & Workout Management System
   Database: repbase
   ===================================================== */

USE repbase;

 
-- Query 1: Display all gyms
 
SELECT * 
FROM gym;


 
-- Query 2: List all members with their gym name
 
SELECT 
    m.member_id,
    m.name AS member_name,
    g.gym_name
FROM member m
JOIN gym g ON m.gym_id = g.gym_id;


 
-- Query 3: Show active memberships with plan details
 
SELECT 
    m.name AS member_name,
    mp.plan_name,
    ms.start_date,
    ms.expiry_date
FROM membership ms
JOIN member m ON ms.member_id = m.member_id
JOIN membership_plan mp ON ms.plan_id = mp.plan_id
WHERE ms.status = 'Active';


 
-- Query 4: Display all exercises with their PRIMARY muscles
 
SELECT 
    e.exercise_name,
    mu.muscle_name AS primary_muscle
FROM exercise e
JOIN exercise_muscle em ON e.exercise_id = em.exercise_id
JOIN muscle mu ON em.muscle_id = mu.muscle_id
WHERE em.muscle_role = 'PRIMARY';


 
-- Query 5: Display exercises with their muscle group
 
SELECT 
    e.exercise_name,
    mu.muscle_name,
    mg.muscle_name AS muscle_group
FROM exercise e
JOIN exercise_muscle em ON e.exercise_id = em.exercise_id
JOIN muscle mu ON em.muscle_id = mu.muscle_id
JOIN major_muscle_group mg ON mu.major_id = mg.muscle_id;


 
-- Query 6: Show workout sessions of each member
 
SELECT 
    m.name AS member_name,
    ws.session_id,
    ws.workout_date,
    ws.duration
FROM workout_session ws
JOIN member m ON ws.member_id = m.member_id
ORDER BY ws.workout_date DESC;


 
-- Query 7: Display detailed set logs with exercise names
 
SELECT 
    ws.session_id,
    e.exercise_name,
    sl.set_no,
    sl.reps,
    sl.weight
FROM set_log sl
JOIN workout_session ws ON sl.session_id = ws.session_id
JOIN exercise e ON sl.exercise_id = e.exercise_id
ORDER BY ws.session_id, sl.set_no;


 
-- Query 8: Count total members per gym
 
SELECT 
    g.gym_name,
    COUNT(m.member_id) AS total_members
FROM gym g
LEFT JOIN member m ON g.gym_id = m.gym_id
GROUP BY g.gym_name;


 
-- Query 9: Calculate total revenue per gym
 
SELECT 
    g.gym_name,
    SUM(p.amount) AS total_revenue
FROM payment p
JOIN membership ms ON p.member_id = ms.member_id
JOIN member m ON ms.member_id = m.member_id
JOIN gym g ON m.gym_id = g.gym_id
GROUP BY g.gym_name;


 
-- Query 10: Count workouts per member
 
SELECT 
    m.name AS member_name,
    COUNT(ws.session_id) AS total_workouts
FROM workout_session ws
JOIN member m ON ws.member_id = m.member_id
GROUP BY m.name;


 
-- Query 11: Members with more than 1 workout
 
SELECT 
    m.name AS member_name,
    COUNT(ws.session_id) AS total_workouts
FROM workout_session ws
JOIN member m ON ws.member_id = m.member_id
GROUP BY m.name
HAVING COUNT(ws.session_id) > 1;


 
-- Query 12: Total sets performed per PRIMARY muscle group
 
SELECT 
    mg.muscle_name AS muscle_group,
    COUNT(*) AS total_sets
FROM set_log sl
JOIN exercise_muscle em ON sl.exercise_id = em.exercise_id
JOIN muscle mu ON em.muscle_id = mu.muscle_id
JOIN major_muscle_group mg ON mu.major_id = mg.muscle_id
WHERE em.muscle_role = 'PRIMARY'
GROUP BY mg.muscle_name;


 
-- Query 13: List all trainers with their gym
 
SELECT 
    t.name AS trainer_name,
    t.specialization,
    g.gym_name
FROM trainer t
JOIN gym g ON t.gym_id = g.gym_id;


 
-- Query 14: Show membership plans with their gym and price
 
SELECT 
    mp.plan_name,
    mp.duration,
    mp.price,
    g.gym_name
FROM membership_plan mp
JOIN gym g ON mp.gym_id = g.gym_id;


 
-- Query 15: Find the most frequently performed exercise
 
SELECT 
    e.exercise_name,
    COUNT(sl.set_no) AS total_sets
FROM set_log sl
JOIN exercise e ON sl.exercise_id = e.exercise_id
GROUP BY e.exercise_name
ORDER BY total_sets DESC
LIMIT 1;
