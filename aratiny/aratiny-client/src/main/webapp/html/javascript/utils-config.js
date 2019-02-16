//var api_url = "http://localhost:8080/aratiny-ws/arabidopsis";
//var api_url = "http://localhost:9090/ws/aratiny";
//var api_url = "http://localhost:9090/aratiny";
var api_url = "${knetminer.api.baseUrl}/aratiny"
//var data_url = "http://knetminer.rothamsted.ac.uk/arabidopsis_data/"; 
//var data_url = "http://qtlnetminer-test.rothamsted.ac.uk/arabidopsis_data/"; // test
//var data_url = "http://maize-dev.rothamsted.ac.uk/arabidopsis_data/"; // test
var species = "Arabidopsis Genome";
var reference_genome = true; //true if you are providing a reference genome
var multiorganisms = false; //true if you specified more than one taxid in the server file config.xml (ie: <entry key="SpeciesTaxId">4113,4081</entry>)
var species_name = 'Arabidopsis thaliana';
