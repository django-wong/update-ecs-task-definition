# Update ECS Task Definition Action

This action can update the image of a container in the task definition, and trigger a service deployment.

# Usage

\[suggestion\] use `aws-actions/configure-aws-credentials@v1` first

Add the following step to your workflow:

```yaml
- name: Update task definition revision and deploy
  id: update-deploy
  uses: django-wong/update-ecs-task-definition@main
  with:
    task-definition-family: ${{ env.ECS_TASK_FAMILY }}
    container: ${{ env.ECS_TASK_CONTAINER_NAME  }}
    image: foo.bar/image:tag
    cluster: ${{ env.ECS_CLUSTER }}
    service: ${{ env.ECS_SERVICE }}
    force-new-deployment: true
```