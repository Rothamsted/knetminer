# AraTiny, Test Knetminer Instance

This project and its submodules define an instance of Knetminer, working on a tiny sample of the Arabidopsis 
dataset (the same as the one used for [Docker](../docker)).

The project has the double function of running automated integration tests (currently inside [aratiny-ws](aratiny-ws))
and running a Knetminer sample instance manually from your computer, [using simple commands](manual-test), so that you 
can try Knetminer and see the effect of new changes on your local (development) copy.

## Summary

* [How to run manually](#how-to-run-manually)
  * [Requirements:](#requirements)
  * [Downloading this project](#downloading-this-project)
  * [Running aratiny\-ws (i\.e\., the Knetminer API)](#running-aratiny-ws-ie-the-knetminer-api)
  * [Running the client (i\.e\., the User interface)](#running-the-client-ie-the-user-interface)
  * [Running in 'Neo4j' mode](#running-in-neo4j-mode)
* [Using the aratinty project for Cypher\-based semantic motif queries\.](#using-the-aratinty-project-for-cypher-based-semantic-motif-queries)
  * [Rules for valid semantic motif queries](#rules-for-valid-semantic-motif-queries)
* [Troubleshooting](#troubleshooting)

*(summary created via [gh-md-toc](https://github.com/ekalinin/github-markdown-toc.go))*


## How to run manually


### Requirements:

  * Java >=11
  * Maven
  * Some [git distribution](https://git-scm.com/downloads)
  * If under Windows, something able to run .sh scripts via Bash (eg, 
  [CygWin](https://www.cygwin.com/), [Windows 10](https://itsfoss.com/install-bash-on-windows/)). 
    * TODO: .bat versions. Meanwhile, you can copy-paste the commands from the [.sh files](manual-test) mentioned below
		and run them from the right directories.


### Downloading this project

Use a shell, cd to a directory you like and clone knetminer:

```bash
git clone https://github.com/Rothamsted/knetminer
```

You should have the `knetminer/` folder available.


### Running aratiny-ws (i.e., the Knetminer API)

Once you have a Knetminer clone in place, `cd knetminer/aratiny/manual-test` and issue `./run-ws.sh`. You should see
a number of messages until Maven tells you the server is running. You can go to your web browser and see if you can get
some sensible answer from an URL like <http://localhost:9090/ws/aratiny/countHits?keyword=seed> (a lot of more messages
pop up on the shell window when you do so).

To stop the server, press the Enter key. **Please note** that Ctrl-C is not good here, since you're running a full Maven 
build, which needs to be completed by properly shutting down Jetty, the internal Java web container server the build is 
using for instantiating Knetminer (It also needs to stop the embedded neo4j database, see below).


### Running the client (i.e., the User interface)

Similarly to the above, open another shell window, cd to `manual-test/` and run `./run-client.sh`. After a while, Maven
should tell you that a new Jetty server is started on the 8080 port, you should find the usual Knetminer user
interface at <http://localhost:8080>. In order for things to be working, both the UI and the API must be running 
(that's why you need two shell windows).

To stop the client, press Ctrl-C (yes, it's inchoerent with respect to the previous case, we're working to simplify the
two procedures).

Apart from having both the API and the UI running when you want to start using the latter, no particular order is 
required to start the two services, though it's natural to start from the API and go ahead if everything is fine
with it.


### Running in 'Neo4j' mode

At the step about the API, run `./run-ws-neo4j.sh` instead of './run-ws.sh'. 

This will trigger a Maven build that runs
an embedded Neo4j database, populated with logically the same data of the test .oxl that is used for the rest of the 
hereby project. For the time being, Knetminer needs to use both a traditional OXL and Neo4j, which is used for 
graph quering (see below). Everything is based on the [ongoing backend](https://github.com/Rothamsted/knetminer-backend).


While the API is running in Neo4j mode you can access the data using the web browser of the Neo4j embedded server. This
is at <http://localhost:17490/>  


## Using the `aratiny` project for Cypher-based semantic motif queries.

The neo4j mode uses Cypher-based queries for finding paths between genes to other entities. The queries are
in the [test folder](aratiny-ws/src/test/resources/knetminer-dataset/config/neo4j). Any
addition of .cypher files to this folder will be used by the `./run-ws-neo4j.sh` above to initially scan the 
test data and find the paths specified by the queries.

Queries are re-read once you re-start the API (stop the current one and re-run `./run-ws-neo4j.sh`, no need to re-run the
UI).


### Rules for valid semantic motif queries 

This is described in our [wiki](https://github.com/Rothamsted/knetminer/wiki/Semantic-Motif-Searching-in-Knetminer).  

We have test queries [here](aratiny-ws/src/test/resources/knetminer-dataset/config/neo4j).  
**Do not change existing .cypher files**. since there are unit tests depending on them.
  
  
## Troubleshooting
  
  * The two commands above rebuild the aratiny project taking dependencies from Maven artifactories. If something doesn't
work, you can try to first build the whole `knetminer/` project (`mvn install` from the git-cloned directory), but you
will need [NPM](https://www.npmjs.com/) installed for that.

  * In cases like the API stopped with Ctrl-C (and not with the Enter key), retrying to run the API again might complain 
that Neo4 or Jetty are still running. You can try to fix this issue by looking at the running processes: 
`ps -efa |grep neo4j`, or `ps -efa |grep jetty`. If you see that there is still a neo4j process, kill its PID (reported
by the `ps` command. Same for jetty, but pay attention to not killing the Jetty server that is running the UI 
(`ps` output mentions either `aratiny-ws` or `aratiny-client`).
