FROM amazonlinux:latest
WORKDIR /tmp
RUN yum -y install tar gzip gcc-c++ findutils
RUN touch ~/.bashrc && chmod +x ~/.bashrc
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
RUN source ~/.bashrc && nvm install 8.10
WORKDIR /build