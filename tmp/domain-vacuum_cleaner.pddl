;; domain file: domain-vacuum_cleaner.pddl
(define (domain vacuum_cleaner)
    (:requirements :strips :negative-preconditions)
    (:predicates
        (in ?r1)
        (door ?r1 ?r2)
        (zero_battery )
        (person_in_room ?r)
        (dirty ?r)
        (clean ?r)
        (sucked ?r)
        (full_battery )              
    )
    
        (:action Move
            :parameters (?r1 ?r2)
            :precondition (and
                (in ?r1)
                (door ?r1 ?r2)
                (not (zero_battery ))
            )
            :effect (and
                (in ?r2)
                (not (in ?r1))
            )
        )
        
        (:action Suck
            :parameters (?r)
            :precondition (and
                (not (person_in_room ?r))
                (in ?r)
                (dirty ?r)
                (not (zero_battery ))
                (not (clean ?r))
            )
            :effect (and
                (not (dirty ?r))
                (sucked ?r)
            )
        )
        
        (:action Charge
            :parameters ()
            :precondition (and
                (not (full_battery ))
                (in kitchen)
            )
            :effect (and
                (full_battery )
                (not (zero_battery ))
            )
        )
)