CREATE TABLE  `interactive_story`.`responses` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`response_text` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for a given response',
`response_fact_id` INT NULL COMMENT  'foreign_key',
`parent_scenario_id` INT NOT NULL COMMENT  'foreign_key',
`response_consequence_scenario_id` INT NOT NULL COMMENT  'foreign_key'
) ENGINE = MYISAM ;

