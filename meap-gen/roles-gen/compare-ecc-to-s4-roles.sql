




-- COMPARE ECC ROLE WITH S4 ROLES
WITH
    ECC_ROLE AS
        (
        SELECT DISTINCT AGR_NAME, S4_DERIVED_ROLE
        FROM    (
                SELECT DISTINCT AGR_NAME
                FROM ECC_AGR_1251_DUMP
                WHERE AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\_%' ESCAPE '\'
                )
        LEFT OUTER JOIN PC_MAPPED_ECC_ROLES ON AGR_NAME = ECC_ROLE
        ),
    S4_ROLE AS (SELECT DISTINCT AGR_NAME FROM "901_AGR_1251_DUMP")

SELECT ECC_ROLE.AGR_NAME AS ECC_ROLE, S4_DERIVED_ROLE, S4_ROLE.AGR_NAME AS "S4_ROLE"
FROM ECC_ROLE LEFT OUTER JOIN S4_ROLE ON S4_ROLE.AGR_NAME = ECC_ROLE.S4_DERIVED_ROLE;


-- GET PC MAPED S4 ROLES OF ECC ROLES

SELECT DISTINCT AGR_NAME, S4_DERIVED_ROLE
FROM (
    SELECT DISTINCT AGR_NAME
    FROM ECC_AGR_1251_DUMP
    WHERE ( AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\_%' ESCAPE '\'))
LEFT OUTER JOIN PC_MAPPED_ECC_ROLES ON AGR_NAME = ECC_ROLE;

-- GET ONLY ZSG ROLES FROM ECC

SELECT DISTINCT AGR_NAME
    FROM ECC_AGR_1251_DUMP
    WHERE ( AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\_%' ESCAPE '\');


-- SELECT COUNT(*) FROM PC_MAPPED_ECC_ROLES;
-- SELECT * FROM PC_MAPPED_ECC_ROLES WHERE ECC_ROLE = 'ZSG_AL_AP.DSP_XXX'


-- AUTH COMPARISON

WITH ECC_AUTH AS (SELECT AGR_NAME,
                         OBJECT,
                         FIELD,
                         LOW,
                         HIGH,
                         (CASE
                              WHEN FIELD = 'PRCTR' AND LOW glob '*[0-9]*'
                                  THEN (SELECT NEW_PC
                                        FROM profit_center_mapping
                                        WHERE OLD_PC = CAST(LOW AS INTEGER)
                                        LIMIT 1)
                              ELSE LOW END)  AS LOWPM,
                         (CASE
                              WHEN FIELD = 'PRCTR' AND HIGH glob '*[0-9]*'
                                  THEN (SELECT NEW_PC
                                        FROM profit_center_mapping
                                        WHERE OLD_PC = CAST(HIGH AS INTEGER)
                                        LIMIT 1)
                              ELSE HIGH END) AS HIGHPM
                  FROM ECC_AGR_1251_DUMP
                  WHERE (AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\_%' ESCAPE '\')),
     S4_AUTH AS (SELECT AGR_NAME,
                        OBJECT,
                        FIELD,
                        LOW,
                        HIGH,
                        (CASE
                             WHEN FIELD = 'PRCTR' AND LOW glob '*[0-9]*'
                                 THEN CAST(LOW AS INTEGER)
                             ELSE LOW END
                            ) AS LOWCASTED,
                        (CASE
                             WHEN FIELD = 'PRCTR' AND HIGH glob '*[0-9]*'
                                 THEN CAST(HIGH AS INTEGER)
                             ELSE HIGH END
                            ) AS HIGHCASTED
                 FROM "901_AGR_1251_DUMP"
                 WHERE (AGR_NAME LIKE 'ZSG%'
                     OR AGR_NAME LIKE 'Z\_%' ESCAPE '\'))

SELECT ECC_AUTH.AGR_NAME,
       ECC_AUTH.OBJECT,
       ECC_AUTH.FIELD,
       ECC_AUTH.LOW as ECC_LOW,
       S4_AUTH.LOW as S4_LOW,

--        ECC_AUTH.LOWPM AS ECC_AUTH_PC_MAPPED,
--        ECC_AUTH.HIGHPM,
--        S4_AUTH.LOWCASTED AS ECC_AUTH_PC_CASTED

--        S4_AUTH.HIGHCASTED
       ECC_AUTH.HIGH as ECC_HIGH,
       S4_AUTH.HIGH as S4_HIGH
FROM ECC_AUTH
         LEFT OUTER JOIN S4_AUTH ON
    ECC_AUTH.AGR_NAME = S4_AUTH.AGR_NAME
        and ECC_AUTH.OBJECT = S4_AUTH.OBJECT
        and ECC_AUTH.FIELD = S4_AUTH.FIELD
        AND ECC_AUTH.LOWPM = S4_AUTH.LOWCASTED
--         AND ECC_AUTH.HIGHPM = S4_AUTH.HIGHCASTED
-- WHERE ECC_AUTH.FIELD = 'PRCTR'
ORDER BY ECC_AUTH.AGR_NAME, ECC_AUTH.OBJECT, ECC_AUTH.FIELD
;


SELECT AGR_NAME,
       OBJECT,
       FIELD,
       (CASE
            WHEN FIELD = 'PRCTR' AND LOW glob '*[0-9]*'
                THEN (SELECT NEW_PC FROM profit_center_mapping WHERE OLD_PC = CAST(LOW AS INTEGER) LIMIT 1)
            ELSE LOW END)  AS LOWPM,
       (CASE
            WHEN FIELD = 'PRCTR' AND HIGH glob '*[0-9]*'
                THEN (SELECT NEW_PC FROM profit_center_mapping WHERE OLD_PC = CAST(HIGH AS INTEGER) LIMIT 1)
            ELSE HIGH END) AS HIGHPM
FROM ECC_AGR_1251_DUMP
WHERE (AGR_NAME LIKE 'ZSG%' OR AGR_NAME LIKE 'Z\_%' ESCAPE '\')
  AND FIELD = 'PRCTR';


SELECT AGR_NAME,
       OBJECT,
       FIELD,
       LOW,
       HIGH,
       (CASE
            WHEN FIELD = 'PRCTR' AND LOW glob '*[0-9]*'
                THEN CAST(LOW AS INTEGER)
            ELSE LOW END
           ) AS LOWCASTED,
       (CASE
            WHEN FIELD = 'PRCTR' AND HIGH glob '*[0-9]*'
                THEN CAST(HIGH AS INTEGER)
            ELSE HIGH END
           ) AS HIGHCASTED
FROM "901_AGR_1251_DUMP"
WHERE (AGR_NAME LIKE 'ZSG%'
    OR AGR_NAME LIKE 'Z\_%' ESCAPE '\')
  AND FIELD = 'PRCTR';