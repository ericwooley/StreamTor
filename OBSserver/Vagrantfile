# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "hashicorp/precise64"
  # config.vm.network "private_network", ip: "192.168.50.4"
  config.vm.network "public_network", ip: "192.168.1.121", bridge: 'en0: Wi-Fi (AirPort)'
  #config.vm.provision :shell, :path => "useApt-cacher-ng.sh"
  config.vm.provision :shell, :path => "bootstrap.sh"
  config.vm.provider "virtualbox" do |v|
    v.memory = 1024
    v.cpus = 2
  end
  config.vm.synced_folder "./", "/var/sites/dev.query-auth", id: "vagrant-root",
      owner: "vagrant",
      group: "www-data",
      mount_options: ["dmode=775,fmode=664"]
end
