workflow "Push to private docker registry" {
  on = "push"
  resolves = ["Push image"]
}

action "Only on master" {
  uses = "actions/bin/filter@9d4ef995a71b0771f438dd7438851858f4a55d0c"
  args = "branch master"
}

action "Build image" {
  uses = "actions/docker/cli@aea64bb1b97c42fa69b90523667fef56b90d7cff"
  needs = ["Only on master"]
  args = "build --build-arg GITHUB_DEPLOY_KEY=\"$GITHUB_TOKEN\" -t $DOCKER_REGISTRY_URL/schnitzelcountdown-update-server:latest ."
  secrets = ["GITHUB_TOKEN", "DOCKER_REGISTRY_URL"]
}

action "Docker Registry login" {
  uses = "actions/docker/login@aea64bb1b97c42fa69b90523667fef56b90d7cff"
  needs = ["Build image"]
  secrets = ["DOCKER_REGISTRY_URL", "DOCKER_USERNAME", "DOCKER_PASSWORD"]
}

action "Push image" {
  uses = "actions/docker/cli@aea64bb1b97c42fa69b90523667fef56b90d7cff"
  needs = ["Docker Registry login"]
  args = "push $DOCKER_REGISTRY_URL/schnitzelcountdown-update-server:latest"
  secrets = ["DOCKER_REGISTRY_URL"]
}
