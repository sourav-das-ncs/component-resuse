import pandas as pd

ROLES = [
    "ZSG_BS_OU.PRO",
    "ZSG_BS_OU.PRO",
    "ZSG_BS_UT.DSP_218",
    "ZSG_BS_UT.DSP_219",
    "ZSG_BS_UT.DSP_220",
    "ZSG_BS_UT.DSP_221",
    "ZSG_BS_UT.DSP_222",
    "ZSG_BS_UT.DSP_222",
    "ZSG_BS_UT.DSP_223",
    "ZSG_BS_UT.DSP_224",
    "ZSG_BS_UT.DSP_225",
    "ZSG_CO_PA.SDSP_XXX",
    "ZSG_CO_PA.SDSP_XXX",
    "ZSG_CS_EM.DSP_221",
    "ZSG_CS_EM.DSP_222",
    "ZSG_CS_EM.DSP_222",
    "ZSG_CS_EM.DSP_224",
    "ZSG_CS_EM.DSP_225",
    "ZSG_CS_LO.PRO-GI_XXX",
    "ZSG_CS_LO.PRO-GR_XXX",
    "ZSG_CS_NO.DSP_222",
    "ZSG_CS_NO.DSP_222",
    "ZSG_CS_NO.DSP_224",
    "ZSG_CS_NO.DSP_225",
    "ZSG_CS_NO.PRO_222",
    "ZSG_CS_NO.PRO_225",
    "ZSG_FI_AR.CUSADM_CONTACTPERSON",
    "ZSG_FI_AR.CUSADM_CONTACTPERSON",
    "ZSG_MM_IM.DSP_218",
    "ZSG_MM_IM.DSP_219",
    "ZSG_MM_IM.DSP_220",
    "ZSG_MM_IM.DSP_221",
    "ZSG_MM_IM.DSP_222",
    "ZSG_MM_IM.DSP_222",
    "ZSG_MM_IM.DSP_223",
    "ZSG_MM_IM.DSP_224",
    "ZSG_MM_IM.DSP_225",
    "ZSG_MM_LO.PRO-GI_225",
    "ZSG_MM_LO.PRO-GR_225",
    "ZSG_MM_LO.PRO-TRS_225",
    "ZSG_MM_LO.PRO-TRS_225",
    "ZSG_MM_MAT.DSP_XXX",
    "ZSG_MM_MAT.DSP_XXX",
    "ZSG_MM_MM.DSP_GSCM",
    "ZSG_MM_MM.GPSI_216",
    "ZSG_MM_MM.STBIN_XXX",
    "ZSG_MM_PO.COND_DSP_GSCM",
    "ZSG_MM_PO.DSP_218",
    "ZSG_MM_PO.DSP_219",
    "ZSG_MM_PO.DSP_220",
    "ZSG_MM_PO.DSP_221",
    "ZSG_MM_PO.DSP_222",
    "ZSG_MM_PO.DSP_222",
    "ZSG_MM_PO.DSP_223",
    "ZSG_MM_PO.DSP_224",
    "ZSG_MM_PO.DSP_225",
    "ZSG_MM_PO.DSP_GSCM",
    "ZSG_MM_PO.DSP_XXX",
    "ZSG_MM_PO.PRO_225",
    "ZSG_MM_PO.PRO_225",
    "ZSG_MM_PO.PRT_218",
    "ZSG_MM_PO.PRT_219",
    "ZSG_MM_PO.PRT_220",
    "ZSG_MM_PO.PRT_221",
    "ZSG_MM_PO.PRT_222",
    "ZSG_MM_PO.PRT_222",
    "ZSG_MM_PO.PRT_223",
    "ZSG_MM_PO.PRT_224",
    "ZSG_MM_PO.PRT_225",
    "ZSG_MM_PO.SP_DSP_GSCM_218",
    "ZSG_MM_PO.SP_DSP_GSCM_219",
    "ZSG_MM_PO.SP_DSP_GSCM_220",
    "ZSG_MM_PO.SP_DSP_GSCM_221",
    "ZSG_MM_PO.SP_DSP_GSCM_222",
    "ZSG_MM_PR.DSP_218",
    "ZSG_MM_PR.DSP_219",
    "ZSG_MM_PR.DSP_220",
    "ZSG_MM_PR.DSP_221",
    "ZSG_MM_PR.DSP_222",
    "ZSG_MM_PR.DSP_222",
    "ZSG_MM_PR.DSP_223",
    "ZSG_MM_PR.DSP_224",
    "ZSG_MM_PR.DSP_225",
    "ZSG_MM_PR.PRO_225",
    "ZSG_MM_PR.PRO_225",
    "ZSG_MM_TO.PRO_225",
    "ZSG_SD_BL.DSP_218",
    "ZSG_SD_BL.DSP_219",
    "ZSG_SD_BL.DSP_220",
    "ZSG_SD_BL.DSP_221",
    "ZSG_SD_BL.DSP_222",
    "ZSG_SD_BL.DSP_222",
    "ZSG_SD_BL.DSP_223",
    "ZSG_SD_BL.DSP_224",
    "ZSG_SD_BL.DSP_225",
    "ZSG_SD_BL.PRO_225",
    "ZSG_SD_BL.PRO_INTER",
    "ZSG_SD_BL.REQCNC_225",
    "ZSG_SD_CMIR.ADM_222",
    "ZSG_SD_CMIR.ADM_225",
    "ZSG_SD_CMIR.DSP_218",
    "ZSG_SD_CMIR.DSP_219",
    "ZSG_SD_CMIR.DSP_220",
    "ZSG_SD_CMIR.DSP_221",
    "ZSG_SD_CMIR.DSP_222",
    "ZSG_SD_CMIR.DSP_222",
    "ZSG_SD_CMIR.DSP_223",
    "ZSG_SD_CMIR.DSP_224",
    "ZSG_SD_CMIR.DSP_225",
    "ZSG_SD_COND.DSP_218",
    "ZSG_SD_COND.DSP_219",
    "ZSG_SD_COND.DSP_220",
    "ZSG_SD_COND.DSP_221",
    "ZSG_SD_COND.DSP_222",
    "ZSG_SD_COND.DSP_222",
    "ZSG_SD_COND.DSP_223",
    "ZSG_SD_COND.DSP_224",
    "ZSG_SD_COND.DSP_225",
    "ZSG_SD_DO.DSP_XXX",
    "ZSG_SD_DO.DSP_XXX",
    "ZSG_SD_DO.PRO_222",
    "ZSG_SD_DO.PRO_225",
    "ZSG_SD_QT.PRO_222",
    "ZSG_SD_QT.PRO_225",
    "ZSG_SD_SO.DSP_218",
    "ZSG_SD_SO.DSP_219",
    "ZSG_SD_SO.DSP_220",
    "ZSG_SD_SO.DSP_221",
    "ZSG_SD_SO.DSP_222",
    "ZSG_SD_SO.DSP_222",
    "ZSG_SD_SO.DSP_223",
    "ZSG_SD_SO.DSP_224",
    "ZSG_SD_SO.DSP_225",
    "ZSG_SD_SO.PRO_222",
    "ZSG_SD_SO.PRO_225",
]


def main():
    df = pd.read_excel('ecc-role-to-s4-roles-with-master-role.xlsx', sheet_name='rolemapping')

    # print(df.head())
    print(df.columns)

    # print(df[df['ECC_ROLE'].eq('ZSG_BS_UT.DSP_209')].iloc[0])

    derived_roles = set()

    for role in ROLES:
        mapped_role = df[df['ECC_ROLE'].eq(role)].iloc[0]
        # print(mapped_role)
        # print(mapped_role.S4_DERIVED_ROLE)
        derived_roles.add(mapped_role.MASTER_ROLE)

    for role in derived_roles:
        print(role)

    pass


if __name__ == '__main__':
    main()