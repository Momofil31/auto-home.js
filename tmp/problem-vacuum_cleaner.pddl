;; problem file: problem-vacuum_cleaner.pddl
(define (problem vacuum_cleaner)
    (:domain vacuum_cleaner)
    (:objects kitchen living_room hallway bathroom_0 garage stairs hallway_upstairs master_bedroom bedroom_0 bedroom_1 bathroom_1 utility_room)
	(:init (door kitchen living_room) (door living_room kitchen) (door living_room hallway) (door hallway living_room) (door hallway bathroom_0) (door bathroom_0 hallway) (door hallway garage) (door garage hallway) (door hallway stairs) (door stairs hallway) (door stairs hallway_upstairs) (door hallway_upstairs stairs) (door hallway_upstairs master_bedroom) (door master_bedroom hallway_upstairs) (door hallway_upstairs bedroom_0) (door bedroom_0 hallway_upstairs) (door hallway_upstairs bedroom_1) (door bedroom_1 hallway_upstairs) (door hallway_upstairs bathroom_1) (door bathroom_1 hallway_upstairs) (door hallway utility_room) (door utility_room hallway) (in utility_room) (sucked kitchen) (sucked living_room) (sucked garage) (sucked bathroom_0) (sucked utility_room) (sucked hallway) (sucked stairs) (sucked hallway_upstairs) (sucked master_bedroom) (sucked bedroom_0) (sucked bedroom_1) (sucked bathroom_1))
	(:goal (and (in kitchen) (full_battery)))
)
