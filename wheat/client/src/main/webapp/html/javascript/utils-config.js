//var data_url = "http://knetminer.rothamsted.ac.uk/wheat_data/";
//var data_url = "http://qtlnetminer-test.rothamsted.ac.uk/wheat_data/"; // now, using HTTP instead of HTTPS
var data_url = "http://maize-dev.rothamsted.ac.uk/wheat_data/";
var species = 'Wheat Genome (IWGSP1, MIPSv2.1)';
var reference_genome = true/*false*/; //true if you are providing a reference genome, false to disable MapView
var multiorganisms = false; //true if you specified more than one taxid in the server file config.xml (ie: <entry key="SpeciesTaxId">4113,4081</entry>)
var longest_chr = 850000000;
var species_name = 'Triticum aestivum';