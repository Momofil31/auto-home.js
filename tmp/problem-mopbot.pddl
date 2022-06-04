;; problem file: problem-mopbot.pddl
(define (problem mopbot)
    (:domain mopbot)
    (:objects kitchen living_room hallway bathroom_0 garage stairs hallway_upstairs master_bedroom bedroom_0 bedroom_1 bathroom_1 utility_room)
	(:init (door kitchen living_room) (door living_room kitchen) (door living_room hallway) (door hallway living_room) (door hallway bathroom_0) (door bathroom_0 hallway) (door hallway garage) (door garage hallway) (door hallway stairs) (door stairs hallway) (door stairs hallway_upstairs) (door hallway_upstairs stairs) (door hallway_upstairs master_bedroom) (door master_bedroom hallway_upstairs) (door hallway_upstairs bedroom_0) (door bedroom_0 hallway_upstairs) (door hallway_upstairs bedroom_1) (door bedroom_1 hallway_upstairs) (door hallway_upstairs bathroom_1) (door bathroom_1 hallway_upstairs) (door hallway utility_room) (door utility_room hallway) (clean kitchen) (clean living_room) (clean garage) (clean bathroom_0) (clean utility_room) (clean hallway) (clean stairs) (clean hallway_upstairs) (clean master_bedroom) (clean bedroom_0) (clean bedroom_1) (clean bathroom_1) (in utility_room))
	(:goal (and (in kitchen) (full_battery)))
)
