CREATE TABLE IF NOT EXISTS  `BGHinteractive`.`stories` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_name` VARCHAR( 100 ) NOT NULL COMMENT  'Text string for a story name',
`start_id` INT NOT NULL COMMENT  'foreign_key',
`is_public` BOOLEAN NOT NULL COMMENT  'enable/disable playing this story'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`boxes` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_id` INT NOT NULL COMMENT  'foreign_key',
`title` VARCHAR( 30 ) NOT NULL COMMENT  'Text string for a box title',
`text` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for any given text',
`x` INT NOT NULL COMMENT  'horizontal position on the graph',
`y` INT NOT NULL COMMENT  'vertical position on the graph'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`choices` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_id` INT NOT NULL COMMENT  'foreign_key',
`choice` VARCHAR( 100 ) NOT NULL COMMENT  'Text string for a choice display',
`fact` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for a given fact',
`box1_id` INT NOT NULL COMMENT  'foreign_key',
`box2_id` INT NOT NULL COMMENT  'foreign_key'
) ENGINE = MYISAM ;
