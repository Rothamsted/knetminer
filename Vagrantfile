# -*- mode: ruby -*-
# vi: set ft=ruby :
VAGRANTFILE_API_VERSION = "2"
HERE = File.dirname(__FILE__)


Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.provider "virtualbox" do |vb|
    #vb.customize ["modifyvm", :id, "--memory", "2048"]
    vb.customize ["modifyvm", :id, "--memory", "10240"]
  end

  config.vm.box = "ubuntu/trusty64"

  config.vm.hostname = 'qtlnetminer'

  config.vm.network "forwarded_port", guest: 80, host: 8030
  config.vm.network "forwarded_port", guest: 8080, host: 8888

  #config.vm.provision :shell, path: "vagrant_files/bootstrap.sh" # runs bootstrap.sh as root
  config.vm.provision :shell, path: "vagrant_files/bootstrap.sh", privileged: false

end
