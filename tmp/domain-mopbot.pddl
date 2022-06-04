;; domain file: domain-mopbot.pddl
(define (domain mopbot)
    (:requirements :strips :negative-preconditions)
    (:predicates
        (in ?r1)
        (door ?r1 ?r2)
        (zero_battery )
        (person_in_room ?r)
        (sucked ?r)
        (dirty ?r)
        (clean ?r)
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
        
        (:action Clean
            :parameters (?r)
            :precondition (and
                (not (person_in_room ?r))
                (in ?r)
                (sucked ?r)
                (not (dirty ?r))
                (not (zero_battery ))
            )
            :effect (and
                (not (sucked ?r))
                (clean ?r)
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