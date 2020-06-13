FROM huggingface/mongoku:latest

## WAIT FOR MONGO TO BE READY
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

CMD ["sh", "-c", "/wait && echo 'ready' && /app/docker-run.sh"]