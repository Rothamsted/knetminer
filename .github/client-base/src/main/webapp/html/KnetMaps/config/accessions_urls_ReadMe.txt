# The KnetMaps/config/url_mappings.json file is used to map accessions seen in the KnetMaps Item Info panel to external URL's.

# For KnetMaps.js users:
# You can add/ edit url's here to match your application's requirements.

# For KnetMiner users:
# Note: If you need to have url's from same "DataSources" (e.g., ENSEMBL) that differ for your various KnetMiner instances, 
# copy the KnetMaps/config/ folder to your client under ./html/ 
# and edit the url's within your copy of this .json file so that the file loaded by the browser is overwritten.

# For example, the following url's in KnetMiner humanDisease are changed by an overwritten file from:
#     {"cv": "ENSEMBL", "weblink": "http://plants.ensembl.org/Search/Results?q=", "cc_restriction": ""},
#     {"cv": "ENSV", "weblink": "http://plants.ensembl.org/Search/Results?q=", "cc_restriction": ""},

# in the .json file at common/client/src/main/webapp/html/KnetMaps/config/

# to:
#     {"cv": "ENSEMBL", "weblink": "http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=", "cc_restriction": ""},
#     {"cv": "ENSV", "weblink": "http://www.ensembl.org/Homo_sapiens/Variation/Explore?db=core;v=", "cc_restriction": ""},

# in the .json file at humanDisease/client/src/main/webapp/html/KnetMaps/config/