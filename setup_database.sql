CREATE TABLE IF NOT EXISTS  `BGHinteractive`.`stories` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_name` VARCHAR( 100 ) NOT NULL COMMENT  'Text string for a story name',
`is_public` BOOLEAN NOT NULL COMMENT  'enable/disable playing this story'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`boxes` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_id` INT NOT NULL COMMENT  'foreign_key',
`title` VARCHAR( 30 ) NOT NULL COMMENT  'Text string for a box title',
`text` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for any given text',
`sound_id` INT NOT NULL COMMENT  'foreign_key',
`x` INT NOT NULL COMMENT  'horizontal position on the graph',
`y` INT NOT NULL COMMENT  'vertical position on the graph',
`grad_primary` VARCHAR( 7 ) NULL COMMENT  'Hex color code for the gradient bg',
`grad_secondary` VARCHAR( 7 ) NULL COMMENT  'Hex color code for the gradient bg'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`choices` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`story_id` INT NOT NULL COMMENT  'foreign_key',
`choice` VARCHAR( 100 ) NOT NULL COMMENT  'Text string for a choice display',
`fact` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for a given fact',
`sound_id` INT NOT NULL COMMENT  'foreign_key',
`box1_id` INT NOT NULL COMMENT  'foreign_key',
`box2_id` INT NOT NULL COMMENT  'foreign_key'
) ENGINE = MYISAM ;

CREATE TABLE IF NOT EXISTS `BGHinteractive`.`sounds` (
`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`name` VARCHAR( 100 ) NOT NULL COMMENT  'Text string for a menu display name',
`url` VARCHAR( 1024 ) NOT NULL COMMENT  'Text string for the url of the sound'
) ENGINE = MYISAM ;
