CREATE TABLE IF NOT EXISTS `BGHinteractive`.`responses` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`response_text` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for a given response',
`response_fact_id` INT NULL COMMENT  'foreign_key',
`parent_scenario_id` INT NOT NULL COMMENT  'foreign_key',
`response_consequence_scenario_id` INT NOT NULL COMMENT  'foreign_key'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`scenarios` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_id` INT NOT NULL COMMENT  'foreign_key',
`scenario_body_id` INT NOT NULL COMMENT  'foreign_key'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS  `BGHinteractive`.`stories` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_name` VARCHAR( 50 ) NOT NULL COMMENT  'Text string for a story name',
`start_screen_body_id` INT NOT NULL COMMENT  'foreign_key',
`end_screen_body_id` INT NOT NULL COMMENT  'foreign_key',
`first_scenario_id` INT NOT NULL COMMENT  'foreign_key'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`facts` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`fact_body` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for a given fact'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`bodies` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`text` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for any given text'
) ENGINE = MYISAM ;
